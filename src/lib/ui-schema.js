const uiSchema = {
  "ui:globalOptions": {
    copyable: true
  },
  "ui:submitButtonOptions": {
    norender: true
  },
  "ui:order": [
    "properties",
    "firstAction",
    "sam",
    "forceCardType"
  ],
  firstAction: {
    "$type": {
        "ui:widget": "hidden"
    }
  },
  properties: {
    "ui:options": {
      addable: false,
      removable: false
    },
    items: {
      name: {
        "ui:readonly": true
      },
      label: {
        "ui:readonly": true
      }
    }
  }
};

export default uiSchema;