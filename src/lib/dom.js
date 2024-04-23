import React from "react";
import { EncodingTemplate, keys } from "./index";

function createRfidTemplate(domContainer, props, newKeys) {
  if (props === undefined) {
    props = {
    };
  }
  if (newKeys) {
    keys.push(...newKeys);
  }
  const el = React.createElement(EncodingTemplate, props);
  ReactDOM.render(el, domContainer);
  return el;
}

document.querySelectorAll('.rfidtemplate')
  .forEach(domContainer => {
    createRfidTemplate(domContainer);
  });

export { createRfidTemplate };