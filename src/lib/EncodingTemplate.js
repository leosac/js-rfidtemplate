import React from "react";
import Form from '@rjsf/bootstrap-4';
import validator from '@rjsf/validator-ajv8';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./EncodingTemplate.css";

import schema from '../json-schema.json';
import uiSchema from "../ui-schema.json";

class EncodingTemplate extends React.Component {
	render() {
		return (<Form schema={schema} validator={validator} uiSchema={uiSchema} />);
	}
}

export default EncodingTemplate;