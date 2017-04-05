import { REHYDRATE } from "redux-persist/constants";
import storedQueries from "../data/queries.js";

const query = (
    state = {
        text: "",
        desc: "",
        // Regex to match property name to display in Graph for nodes.
        propertyRegex: "name",
        shareId: ""
    },
    action
) => {
    switch (action.type) {
        case "SELECT_QUERY":
            return {
                ...state,
                text: action.text,
                desc: action.desc === "" ? state.desc : action.desc
            };
        case "UPDATE_PROPERTY_REGEX":
            return {
                ...state,
                propertyRegex: action.regex
            };
        case REHYDRATE:
            var incoming = action.payload.previousQueries;
            // If previousQueries already has entries, lets pick the last one.
            if (incoming && incoming.length !== 0 && state.text === "") {
                return {
                    ...state,
                    text: incoming[0].text
                };
            }
            // Else if there are no previous queries, lets grab the first entry
            // from stored queries.
            if (!incoming || incoming.length === 0) {
                return {
                    ...state,
                    text: storedQueries[0].text
                };
            }
            return state;
        default:
            return state;
    }
};

export default query;
