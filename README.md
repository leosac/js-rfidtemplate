# js-rfidtemplate
JavaScript library to design RFID Template

## Theme

The editor uses the light theme by default. Set the optional `theme` prop to
`"dark"` or `"light"` in code; no theme switch is displayed in the UI.

```jsx
<EncodingTemplate theme="dark" />
```

For the DOM API, pass the same option in the props argument:

```js
rfidtemplate.createRfidTemplate(container, { theme: "dark" });
```

Updating the React prop switches themes without resetting the editor. Theme styles
are scoped to each editor instance and do not change the surrounding page.
Values other than `"light"` and `"dark"` are rejected with an error.
