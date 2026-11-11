import React from "react";
import ReactDOM from "react-dom";
import { EncodingTemplate, keys, parameters } from "./index";

function createRfidTemplate(domContainer, props, newKeys, newParameters) {
  if (props === undefined) {
    props = {
    };
  }
  if (newKeys) {
    keys.push(...newKeys);
  }
  if (newParameters) {
    parameters.push(...newParameters);
  }
  const el = React.createElement(EncodingTemplate, props);
  ReactDOM.render(el, domContainer);
  return el;
}

document.querySelectorAll('.rfidtemplate')
  .forEach(domContainer => {
    createRfidTemplate(domContainer);
  });

export { createRfidTemplate, keys, parameters };