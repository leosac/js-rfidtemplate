import React from "react";
import { withTranslation } from "react-i18next";

class EncodingActionTrigger extends React.Component {
	render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
            </div>
        );
    }
}

export default withTranslation()(EncodingActionTrigger);