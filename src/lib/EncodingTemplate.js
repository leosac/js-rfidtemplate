import React from "react";
import Form from '@rjsf/bootstrap-4';
import validator from '@rjsf/validator-ajv8';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./EncodingTemplate.css";

import schema from '../json-schema.json';
import data from '../default-template.json';
import uiSchema from "./ui-schema.js";
import uiTemplates from "./ui-templates.js";
import {keys, uiWidgets} from "./ui-widgets.js";

class EncodingTemplate extends React.Component {

	constructor(props) {
        super(props);
		this.state = {
			template: (props.content) ? JSON.parse(props.content) : data
		}
        this.initProps();

		this.formRef = React.createRef(null);
	}

	initProps() {
		//Check if "onEdit" option is a function
        if (this.props.onEdit && typeof this.props.onEdit !== "function")
        {
            console.error('JsRfidTemplate : onEdit option is not a function, option removed.');
            delete this.props.onEdit;
        }

        //Check if "onSubmit" option is a function
        if (this.props.onSubmit && typeof this.props.onSubmit !== "function")
        {
            console.error('JsRfidTemplate : onSubmit option is not a function, option removed.');
            delete this.props.onSubmit;
        }

		//Check if "onLoaded" option is a function
        if (this.props.onLoaded && typeof this.props.onLoaded !== "function")
        {
            console.error('JsRfidTemplate : onLoaded option is not a function, option removed.');
            delete this.props.onLoaded;
        }
	}

	componentDidMount() {
		if (this.props.onLoaded) {
			this.props.onLoaded(this);
		}
	}

	render() {
		return (<Form ref={this.formRef}
				      schema={schema}
					  validator={validator}
					  uiSchema={uiSchema}
					  templates={uiTemplates}
					  widgets={uiWidgets}
					  formData={this.state.template}
					  onChange={this.props.onEdit}
					  onSubmit={this.props.onSubmit} />);
	}
}

EncodingTemplate.defaultProps = {
	onSubmit: undefined,
	onLoaded: undefined
}

export { EncodingTemplate, keys };