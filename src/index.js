import React from "react";
import ReactDOM from "react-dom";
import { EncodingTemplate } from "./lib";

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