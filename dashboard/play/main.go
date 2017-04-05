package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/dgraph-io/dgraph/client"
	"github.com/dgraph-io/dgraph/protos/graphp"
	"github.com/dgraph-io/dgraph/x"
	"google.golang.org/grpc"
)

var (
	dgraph = flag.String("d", "127.0.0.1:8082", "Dgraph server address")
)

func addCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers",
		"Authorization,Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token,"+
			"X-Auth-Token, Cache-Control, X-Requested-With")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Connection", "close")
	w.Header().Set("Content-Type", "application/json")
}

type Error struct {
	Message string `json:"error"`
}

func writeError(w http.ResponseWriter, err string) {
	js, _ := json.Marshal(Error{
		Message: err,
	})
	w.WriteHeader(http.StatusBadRequest)
	w.Write(js)
}

type ResponseUid struct {
	Uid string `json:"id"`
}

func saveQuery(w http.ResponseWriter, r *http.Request) {
	addCorsHeaders(w)

	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		writeError(w, fmt.Sprintf("Invalid http method. Expected POST, got: %v",
			r.Method))
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writeError(w, "Couldn't read request body.")
		return
	}

	var q ResponseQuery
	err = json.Unmarshal(body, &q)
	if err != nil {
		writeError(w, fmt.Sprintf("Couldn't unmarshal into JSON: %v", string(body)))
		return
	}

	if q.Query == "" {
		writeError(w, "Empty query.")
		return
	}

	req := client.Req{}

	// Lets check if we already have this query.
	req.SetQuery(fmt.Sprintf(`
{
	query(func:eq(query, "%s")) {
		_uid_
	}
}`, q.Query), map[string]string{})

	resp, err := c.Run(context.Background(), req.Request())
	x.Checkf(err, "While running a query to perform a eq match on a string.")
	x.AssertTruef(len(resp.N[0].Children) <= 1, "Got multiple queries with the same query string.")
	if len(resp.N[0].Children) > 0 {
		// We have this query already stored, lets return the Uid.
		js, err := json.Marshal(ResponseUid{
			Uid: fmt.Sprintf("%#x", resp.N[0].Children[0].Uid),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Write(js)
		return
	}

	// We don't have this query, lets save it and return the Uid.
	req = client.Req{}
	// Lets attach the new node to a root node, so that we can count the number
	// of shares later.
	req.AddMutation(graphp.NQuad{
		Subject:   "root",
		Predicate: "share",
		ObjectId:  "_:q",
	}, client.SET)

	nq := graphp.NQuad{
		Subject:   "_:q",
		Predicate: "query",
	}
	client.Str(q.Query, &nq)
	req.AddMutation(nq, client.SET)

	resp, err = c.Run(context.Background(), req.Request())
	x.Checkf(err, "While running mutation to save a new query.")
	x.AssertTruef(resp.AssignedUids["q"] != 0, "Expected q in assigned uids map to not be empty.")

	js, err := json.Marshal(ResponseUid{
		Uid: fmt.Sprintf("%#x", resp.AssignedUids["q"]),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Write(js)
}

type ResponseQuery struct {
	Query string `json:"query"`
}

func retrieveQuery(w http.ResponseWriter, r *http.Request) {
	addCorsHeaders(w)

	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "GET" {
		writeError(w, fmt.Sprintf("Invalid http method. Expected GET, got: %v",
			r.Method))
		return
	}

	id := r.FormValue("id")
	if id == "" {
		writeError(w, "Id is empty.")
		return
	}

	req := client.Req{}
	// Lets check if we already have this query.
	req.SetQuery(fmt.Sprintf(`
{
	query(id: %s) {
		query
	}
}`, id), map[string]string{})

	fmt.Println(fmt.Sprintf(`
{
	query(id: %s) {
		query
	}
}`, id))
	resp, err := c.Run(context.Background(), req.Request())
	x.Checkf(err, "While trying to fetch query using _uid_.")
	x.AssertTruef(len(resp.N[0].Children) <= 1, "Got multiple queries with the same _uid_.")

	if len(resp.N[0].Children) == 0 {
		writeError(w, "No query found with the given id")
		return
	}

	js, _ := json.Marshal(ResponseQuery{
		Query: resp.N[0].Children[0].Properties[0].Value.GetStrVal(),
	})
	w.Write(js)
}

var c graphp.DgraphClient

func main() {
	conn, err := grpc.Dial(*dgraph, grpc.WithInsecure())
	x.Check(err)

	// Creating a new client.
	c = graphp.NewDgraphClient(conn)

	http.HandleFunc("/save", saveQuery)
	http.HandleFunc("/retrieve", retrieveQuery)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
