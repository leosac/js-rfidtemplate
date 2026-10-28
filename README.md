# js-rfidtemplate
JavaScript library to design RFID Template

## Key selection

Fields marked with `x-key` use a searchable dropdown. Opening it focuses a search
input inside the menu, matching key names and IDs case-insensitively. Use the
arrow keys to navigate results and Enter to select; Escape dismisses the menu.
Closing the dropdown clears the filter without changing the selected key.
Nullable fields include a "No key" option, and references to unknown keys remain
selectable.

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
