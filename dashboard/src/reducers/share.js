const share = (
    state = {
        id: ""
    },
    action
) => {
    switch (action.type) {
        case "UPDATE_SHARE_ID":
            return {
                ...state,
                id: action.shareId
            };
        default:
            return state;
    }
};

export default share;
