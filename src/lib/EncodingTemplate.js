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
import { buildNavigationTree as buildTreeNavigation } from "./ui-tree.js";

class EncodingTemplate extends React.Component {

	constructor(props) {
        super(props);
		this.state = {
			template: (props.content) ? JSON.parse(props.content) : data,
			navigation: buildTreeNavigation(schema, (props.content) ? JSON.parse(props.content) : data, [], 0, new Set(), schema),
			sidebarCollapsed: false,
			activeSection: null,
			treeVersion: 0
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

	getNavigationSectionIds(items = this.state.navigation || []) {
		const sectionIds = new Set();
		const collect = (nodes) => {
			nodes.forEach((node) => {
				sectionIds.add(node.id);
				if (node.children && node.children.length > 0) {
					collect(node.children);
				}
			});
		};
		collect(items);
		return sectionIds;
	}

	normalizeFormChange(change) {
		if (change && typeof change === 'object' && Object.prototype.hasOwnProperty.call(change, 'formData')) {
			return change;
		}
		return { formData: change };
	}

	findSectionIdFromElement(target, sectionIds = this.getNavigationSectionIds()) {
		let element = target;
		while (element && element !== document.body) {
			if (element.id && sectionIds.has(element.id)) {
				return element.id;
			}
			element = element.parentElement;
		}
		return null;
	}

	handleFormInteraction = (event) => {
		const activeSection = this.findSectionIdFromElement(event.target);
		if (activeSection && activeSection !== this.state.activeSection) {
			this.setState({ activeSection });
		}
	}

	toggleSidebar = () => {
		this.setState((prevState) => ({ sidebarCollapsed: !prevState.sidebarCollapsed }));
	}

	handleSectionNavigation = (sectionId) => {
		this.setState({ activeSection: sectionId });
		window.requestAnimationFrame(() => {
			const section = document.getElementById(sectionId);
			if (section) {
				section.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	}

	handleFormChange = (change) => {
		const changeEvent = this.normalizeFormChange(change);
		const { formData } = changeEvent;
		const navigation = buildTreeNavigation(schema, formData, [], 0, new Set(), schema);
		this.setState((prevState) => ({
			template: formData,
			navigation,
			treeVersion: prevState.treeVersion + 1
		}));
		if (this.props.onEdit) {
			this.props.onEdit(changeEvent);
		}
	}

	renderNavigation(items, depth = 0) {
		return (
			<ul className={`encoding-template-nav-list depth-${depth}`}>
				{items.map((item) => (
					<li key={item.id} className={this.state.activeSection === item.id ? 'active' : ''}>
						<button type="button" className="encoding-template-nav-button" onClick={() => this.handleSectionNavigation(item.id)}>
							{item.kind && <span className={`encoding-template-nav-icon ${item.kind}`} aria-hidden="true" />}
							<span className="encoding-template-nav-label">{item.title}</span>
						</button>
						{item.children && item.children.length > 0 && this.renderNavigation(item.children, depth + 1)}
					</li>
				))}
			</ul>
		);
	}

	render() {
		const navigation = this.state.navigation || [];

		return (
			<div className={`encoding-template-shell ${this.state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
				<aside className="encoding-template-sidebar">
					<div className="encoding-template-sidebar-header">
						<strong className="encoding-template-sidebar-title">Tree navigation</strong>
						<button type="button" className="encoding-template-sidebar-toggle" onClick={this.toggleSidebar}>
							{this.state.sidebarCollapsed ? '▶' : '◀'}
						</button>
					</div>
					{!this.state.sidebarCollapsed && this.renderNavigation(navigation)}
				</aside>
				<div className="encoding-template-form" onFocusCapture={this.handleFormInteraction} onClickCapture={this.handleFormInteraction}>
					<Form ref={this.formRef}
						  schema={schema}
						  validator={validator}
						  uiSchema={uiSchema}
						  templates={uiTemplates}
						  widgets={uiWidgets}
						  formData={this.state.template}
						  onChange={this.handleFormChange}
						  onSubmit={this.props.onSubmit} />
				</div>
			</div>
		);
	}
}

EncodingTemplate.defaultProps = {
	onSubmit: undefined,
	onLoaded: undefined
}

export { EncodingTemplate, keys };