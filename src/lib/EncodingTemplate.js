import React from "react";
import Form from '@rjsf/bootstrap-4';
import validator from '@rjsf/validator-ajv8';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./EncodingTemplate.css";

import schema from '../json-schema.json';
import data from '../default-template.json';
import uiSchema from "./ui-schema.js";
import uiTemplates from "./ui-templates.js";

class EncodingTemplate extends React.Component {
	render() {
		return (<Form schema={schema} templates={uiTemplates} validator={validator} uiSchema={uiSchema} formData={data} />);
	}
}

export default EncodingTemplate;