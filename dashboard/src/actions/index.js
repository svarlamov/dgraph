import {
    timeout,
    checkStatus,
    isNotEmpty,
    showTreeView,
    processGraph,
    dgraphAddress,
    queryServerAddress
} from "../containers/Helpers";

import storedQueries from "../data/queries.js";

// TODO - Check if its better to break this file down into multiple files.

export const updatePartial = partial => ({
    type: "UPDATE_PARTIAL",
    partial
});

export const selectQuery = (text, desc) => ({
    type: "SELECT_QUERY",
    text,
    desc
});

export const deleteQuery = idx => ({
    type: "DELETE_QUERY",
    idx
});

export const deleteAllQueries = () => ({
    type: "DELETE_ALL_QUERIES"
});

export const setCurrentNode = node => ({
    type: "SELECT_NODE",
    node
});

const addQuery = (text, desc) => ({
    type: "ADD_QUERY",
    text,
    desc
});

const isFetching = () => ({
    type: "IS_FETCHING",
    fetching: true
});

const fetchedResponse = () => ({
    type: "IS_FETCHING",
    fetching: false
});

const saveSuccessResponse = (text, data, isMutation) => ({
    type: "SUCCESS_RESPONSE",
    text,
    data,
    isMutation
});

const saveErrorResponse = (text, json = {}) => ({
    type: "ERROR_RESPONSE",
    text,
    json
});

const saveResponseProperties = obj => ({
    type: "RESPONSE_PROPERTIES",
    ...obj
});

export const updateLatency = obj => ({
    type: "UPDATE_LATENCY",
    ...obj
});

export const renderGraph = (query, result, treeView) => {
    return (dispatch, getState) => {
        let [nodes, edges, labels, nodesIdx, edgesIdx] = processGraph(
            result,
            treeView,
            query,
            getState().query.propertyRegex
        );

        dispatch(
            updateLatency({
                server: result.server_latency && result.server_latency.total
            })
        );

        dispatch(updatePartial(nodesIdx < nodes.length));

        dispatch(
            saveResponseProperties({
                plotAxis: labels,
                allNodes: nodes,
                allEdges: edges,
                numNodes: nodes.length,
                numEdges: edges.length,
                nodes: nodes.slice(0, nodesIdx),
                edges: edges.slice(0, edgesIdx),
                treeView: treeView,
                data: result
            })
        );
    };
};

export const resetResponseState = () => ({
    type: "RESET_RESPONSE"
});

export const runQuery = query => {
    return dispatch => {
        dispatch(resetResponseState());
        dispatch(isFetching());
        timeout(
            60000,
            fetch(dgraphAddress() + "/query?debug=true", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: query
            })
                .then(checkStatus)
                .then(response => response.json())
                .then(function handleResponse(result) {
                    dispatch(fetchedResponse());
                    if (
                        result.code !== undefined &&
                        result.message !== undefined
                    ) {
                        if (result.code.startsWith("Error")) {
                            dispatch(saveErrorResponse(result.message));
                            // This is the case in which user sends a mutation.
                            // We display the response from server.
                        } else {
                            dispatch(addQuery(query));
                            dispatch(saveSuccessResponse("", result, true));
                        }
                    } else if (isNotEmpty(result)) {
                        dispatch(addQuery(query));
                        let mantainSortOrder = showTreeView(query);
                        dispatch(saveSuccessResponse("", result, false));
                        dispatch(renderGraph(query, result, mantainSortOrder));
                    } else {
                        dispatch(
                            saveErrorResponse(
                                "Your query did not return any results.",
                                result
                            )
                        );
                    }
                })
        )
            .catch(function(error) {
                console.log(error.stack);
                var err = (error.response && error.response.text()) ||
                    error.message;
                return err;
            })
            .then(function(errorMsg) {
                if (errorMsg !== undefined) {
                    dispatch(fetchedResponse());
                    dispatch(saveErrorResponse(errorMsg));
                }
            });
    };
};

export const updateFullscreen = fs => ({
    type: "UPDATE_FULLSCREEN",
    fs
});

export const updateProgress = perc => ({
    type: "UPDATE_PROGRESS",
    perc,
    display: true
});

export const hideProgressBar = () => ({
    type: "HIDE_PROGRESS",
    dispatch: false
});

export const updateRegex = regex => ({
    type: "UPDATE_PROPERTY_REGEX",
    regex
});

export const addScratchpadEntry = entry => ({
    type: "ADD_SCRATCHPAD_ENTRY",
    ...entry
});

export const deleteScratchpadEntries = () => ({
    type: "DELETE_SCRATCHPAD_ENTRIES"
});

export const updateShareId = shareId => ({
    type: "UPDATE_SHARE_ID",
    shareId
});

export const queryFound = found => ({
    type: "QUERY_FOUND",
    found: found
});

export const getShareId = (dispatch, getState) => {
    let query = getState().query.text;
    timeout(
        6000,
        fetch(queryServerAddress() + "/save", {
            method: "POST",
            mode: "cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: encodeURI(query)
            })
        })
            .then(checkStatus)
            .then(response => response.json())
            .then(function handleResponse(result) {
                if (result.id !== undefined) {
                    dispatch(updateShareId(result.id));
                }
                // else display error?
            })
    )
        .catch(function(error) {
            console.log(error.stack);
            var err = (error.response && error.response.text()) ||
                error.message;
            return err;
        })
        .then(function(errorMsg) {
            if (errorMsg !== undefined) {
                // Display somewhere.
            }
        });
};

export const selectAndRun = (text, desc) => {
    return dispatch => {
        dispatch(selectQuery(text, desc));
        dispatch(runQuery(text));
    };
};

export const getQuery = shareId => {
    return dispatch => {
        timeout(
            6000,
            fetch(queryServerAddress() + "/retrieve?id=" + shareId, {
                method: "GET",
                mode: "cors",
                headers: {
                    Accept: "application/json"
                }
            })
                .then(checkStatus)
                .then(response => response.json())
                .then(function handleResponse(result) {
                    if (result.error === undefined) {
                        dispatch(selectQuery(decodeURI(result.query)));
                        return;
                    }
                })
        )
            .catch(function(error) {
                dispatch(queryFound(false));

                console.log(error.stack);
                var err = (error.response && error.response.text()) ||
                    error.message;
                return err;
            })
            .then(function(errorMsg) {
                if (errorMsg !== undefined) {
                    // Display somewhere.
                }
            });
    };
};

export const updateInitialQuery = () => {
    return (dispatch, getState) => {
        let incoming = getState().previousQueries;
        if (incoming && incoming.length !== 0) {
            dispatch(selectQuery(incoming[0].text));
            return;
        }
        // Else if there are no previous queries, lets grab the first entry
        // from stored queries.
        if (!incoming || incoming.length === 0) {
            dispatch(selectQuery(storedQueries[0].text));
            return;
        }
    };
};
