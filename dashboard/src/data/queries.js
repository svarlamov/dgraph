export default [
    {
        desc: "Top 10 Steven Spielberg movies?",
        text: `
        {
		    var(func:allofterms(name, "steven spielberg")) {
		        name@en
		        films as director.film {
		            p as count(starring)
		            q as count(genre)
		            r as count(country)
		            score as sumvar(p, q, r)
		        }
		    }
		    TopMovies(id: var(films), orderdesc: var(score), first: 10){
		        name@en
		        var(score)
		    }
		}`,
        lastRun: Date.now()
    },
    {
        desc: "Who played Harry Potter?",
        text: `
  {
  HP(func: allofterms(name, "Harry Potter")) @cascade {
    name@en
    starring{
        performance.character @filter(allofterms(name, "harry")) {
          name@en
        }
        performance.actor {
            name@en
         }
    }
  }
}`,
        lastRun: Date.now()
    },
    {
        desc: "How are Spielberg and Matt Deamon related?",
        text: `{
  A as shortest(from: 0x3b0de646eaf32b75, to: 0x36692145960cfceb) {
    director.film
    starring
    performance.actor
  }

  names(id: var(A)) {
    name@en
  }
}`,
        lastRun: Date.now()
    },
    {
        desc: "Random actor details of a top genre",
        text: `{
    recurse(func: gt(count(~genre), 50000)){
        name@en
        ~genre (first:10) @filter(gt(count(starring), 100))
        starring (first: 3)
        performance.actor
    }
}`,
        lastRun: Date.now()
    }
];
