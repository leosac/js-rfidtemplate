import React from "react";
import { EncodingTemplate } from "./index";

function createRfidTemplate(domContainer, props) {
  if (props === undefined) {
    props = {
    };
  }
  const el = React.createElement(EncodingTemplate, props);
  ReactDOM.render(el, domContainer);
  return el;
}

document.querySelectorAll('.rfidtemplate')
  .forEach(domContainer => {
    createCardEditor(domContainer);
  });

export { createRfidTemplate };