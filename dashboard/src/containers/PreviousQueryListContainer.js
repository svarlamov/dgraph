import { connect } from "react-redux";

import PreviousQueryList from "../components/PreviousQueryList";
import {
    selectAndRun,
    deleteQuery,
    resetResponseState,
    deleteAllQueries
} from "../actions";

const mapStateToProps = state => ({
    queries: state.previousQueries,
    query: state.query.text
});

const mapDispatchToProps = dispatch => ({
    select: (text, desc) => {
        dispatch(selectAndRun(text, desc));
    },
    deleteQuery: idx => {
        dispatch(deleteQuery(idx));
    },
    deleteAll: () => {
        dispatch(deleteAllQueries());
    },
    resetResponse: () => {
        dispatch(resetResponseState());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(PreviousQueryList);
