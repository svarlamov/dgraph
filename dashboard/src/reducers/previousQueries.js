import { REHYDRATE } from "redux-persist/constants";
import storedQueries from "../data/queries.js";

const query = (state, action) => {
    switch (action.type) {
        case "ADD_QUERY":
            return {
                text: action.text,
                lastRun: Date.now()
            };
        default:
            return state;
    }
};

const queries = (state = [], action) => {
    switch (action.type) {
        case "ADD_QUERY":
            let trimmedQuery = action.text.trim();
            return [
                query(undefined, action),
                ...state.filter(q => q.text.trim() !== trimmedQuery)
            ];
        case "DELETE_QUERY":
            return [
                ...state.slice(0, action.idx),
                ...state.slice(action.idx + 1)
            ];
        case "DELETE_ALL_QUERIES":
            return [];
        case REHYDRATE:
            var payload = action.payload.previousQueries;
            if (!payload || payload.previousQueries.length === 0)
                return {
                    ...state,
                    storedQueries
                };
            return state;
        default:
            return state;
    }
};

export default queries;
