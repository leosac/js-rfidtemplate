/* eslint-disable no-template-curly-in-string -- Parameter references are resolved by the host application. */
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { EncodingTemplate, keys, parameters } from "./lib";

keys.push(
  { id: "demo-master-key", name: "Demo PICC Master Key" },
  { id: "demo-application-key", name: "Demo Application Key" }
);
parameters.push(
  { key: "applicationId", value: 1122867, description: "Access control application (0x112233)" },
  { key: "credentialFile", value: 1, description: "File containing the cardholder credential" },
  { key: "backupFile", value: 2 },
  { key: "siteName", value: "Head office", description: "Example text parameter, resolved by the host application" }
);

const sampleTemplate = {
  firstAction: {
    $type: "DESFire.SelectApplication",
    aid: "${applicationId}",
    onSuccess: {
      callActions: [{
        $type: "DESFire.Authenticate",
        keyNo: 0,
        key: { keyId: "demo-application-key" },
        onSuccess: {
          callActions: [{
            $type: "DESFire.ReadData",
            fileNo: "${credentialFile}",
            offset: 0,
            byteLength: 16,
            encryptionMode: "encrypt"
          }]
        }
      }]
    }
  }
};

const App = () => {
  const [template, setTemplate] = useState(sampleTemplate);
  return (
  <div style={{ width: 860, margin: "15px auto" }}>
	<h1>Define your custom RFID Encoding Template</h1>
	<p>This react component allows you to define the RFID encoding template from a web UI.</p>
	<p>
		Use the JSON output as a `template` for further processing.
		It usually needs to be consumed by an application implementing the business value (eg. a <a href="https://leosac.com/credential-provisioning/">credential provisioning solution</a>).
	</p>
    <p>
      This example selects an application, authenticates with a demo key, and reads a file.
      DESFire Application Id and File No fields can use literal numbers or parameter references.
      Use the parameter picker to search by key, value or description; the application resolves
      references when processing the template.
    </p>
    <h2>Example keys</h2>
    <ul>{keys.map(key => <li key={key.id}>{key.name} ({key.id})</li>)}</ul>
    <h2>Example parameters</h2>
    <ul>{parameters.map(parameter => (
      <li key={parameter.key}>
        <code>{parameter.key}</code> = {parameter.value}
        {parameter.description && <> - {parameter.description}</>}
      </li>
    ))}</ul>
    <EncodingTemplate
      chip="DESFire"
      content={JSON.stringify(sampleTemplate)}
      onEdit={event => setTemplate(event.formData)} />
    <h2>Template JSON</h2>
    <pre>{JSON.stringify(template, null, 2)}</pre>
  </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));