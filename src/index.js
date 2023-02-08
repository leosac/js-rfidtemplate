import React from "react";
import ReactDOM from "react-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { EncodingTemplate } from "./lib";

i18n.use(initReactI18next)
	.init({
		resources: {
			en: {
				translation: require('./i18n/en.json')
			}
		},
		lng: 'en',
		fallbackLng: 'en'
	})

const App = () => (
  <div style={{ width: 640, margin: "15px auto" }}>
	<h1>Define your custom RFID Encoding Template</h1>
	<p>This react component allows you to define the RFID encoding template from a web UI.</p>
	<p>
		Use the JSON output as a `template` for further processing.
		It usually needs to be consumed by an application implementing the business value (eg. a <a href="https://leosac.com/credential-provisioning/">credential provisioning solution</a>).
	</p>
    <EncodingTemplate chip="DESFire" />
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));