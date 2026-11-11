# js-rfidtemplate
JavaScript library to design RFID Template

## Key selection

Fields marked with `x-key` use a searchable dropdown. Opening it focuses a search
input inside the menu, matching key names and IDs case-insensitively. Use the
arrow keys to navigate results and Enter to select; Escape dismisses the menu.
Closing the dropdown clears the filter without changing the selected key.
Nullable fields include a "No key" option, and references to unknown keys remain
selectable.

## Parameters

The host application can populate the exported `parameters` list before rendering
the editor, just like the `keys` list:

```jsx
import { EncodingTemplate, keys, parameters } from "js-rfidtemplate";

keys.push({ id: "application-key", name: "Application authentication key" });
parameters.push(
  { name: "applicationId", value: 1122867, description: "Access control application" },
  { name: "credentialFile", value: 1 }
);

<EncodingTemplate />;
```

Each parameter has a unique, nonempty `name`, a `value` (text or number), and an
optional human-friendly `description`. Names cannot contain braces or line breaks.
Populate or update the shared list before rendering (or rerendering) the editor.
Like `keys`, it is shared across editor instances.
The DOM bundle also exposes `rfidtemplate.keys` and `rfidtemplate.parameters`.

Initially, only DESFire Application Id (`aid`) and File No fields (including
source/target file numbers) support references. Click **Use parameter** to open
a searchable picker that displays the name, value and optional description.
Selecting an entry stores an explicit reference such as `"${applicationId}"`,
not its current value. Unknown references are preserved when reopening templates.
Click **Use literal value** to return to numeric entry, including hexadecimal
entry for AIDs.
The **Use parameter** link is hidden when no parameters are available. Existing
references remain visible and can still be switched back to literal values.

Existing JSON templates remain valid: literal numbers retain their numeric type,
defaults and limits. Supported fields additionally accept a complete
`${parameterName}` string; other strings and interpolated expressions are invalid.
Other text and number fields retain their existing schema. References are not
resolved or type-checked against the list by this UI: the consuming application
must resolve them and validate the resulting values before encoding.

Run `npm start` for a sample with keys, parameters (with and without descriptions),
nested DESFire actions using references, and a live JSON preview.

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
