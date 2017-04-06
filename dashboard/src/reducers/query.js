const query = (
    state = {
        text: "",
        desc: "",
        // Regex to match property name to display in Graph for nodes.
        propertyRegex: "name"
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
        default:
            return state;
    }
};

export default query;
