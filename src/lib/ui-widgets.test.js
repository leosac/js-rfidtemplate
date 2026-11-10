/* eslint-disable no-template-curly-in-string -- Tests use literal parameter references. */
import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import rawUserEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { keys, parameters, uiWidgets } from "./ui-widgets";

const TextWidget = uiWidgets.TextWidget;
const SelectWidget = uiWidgets.SelectWidget;
/* eslint-disable testing-library/no-unnecessary-act -- user-event v13 requires explicit act with this React 18 setup. */
const userEvent = {
  click: element => act(() => rawUserEvent.click(element)),
  keyboard: text => act(() => { rawUserEvent.keyboard(text); }),
  type: (element, text) => act(() => { rawUserEvent.type(element, text); }),
  tab: () => act(() => rawUserEvent.tab())
};
/* eslint-enable testing-library/no-unnecessary-act */

describe("key selection", () => {
  const onChange = jest.fn();
  const props = {
    id: "keyId",
    name: "keyId",
    label: "Key",
    schema: { type: "string", "x-key": true },
    value: "master-001",
    onChange
  };
  const openDropdown = () => userEvent.click(screen.getByRole("button", { name: /^Key:/ }));
  const search = value => fireEvent.change(screen.getByRole("searchbox"), { target: { value } });

  beforeEach(() => {
    keys.push(
      { id: "master-001", name: "PICC Master Key" },
      { id: "access-002", name: "Access Control" },
      { id: "backup-003", name: "Backup Master Key" }
    );
    onChange.mockClear();
  });

  afterEach(() => {
    keys.splice(0, keys.length);
  });

  it("shows a single dropdown and focuses search inside its menu when opened", () => {
    render(<TextWidget {...props} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    openDropdown();
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(within(screen.getByRole("dialog")).getByRole("searchbox")).toHaveFocus();
    expect(screen.getByRole("button", { name: /^Key:/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "PICC Master Key" })).toHaveAttribute("aria-selected", "true");
  });

  it("filters by name without changing selection and restores results on clear", () => {
    render(<TextWidget {...props} />);
    openDropdown();
    search("  aCcEsS  ");
    expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Access Control"]);
    expect(screen.getByRole("button", { name: /^Key:/ })).toHaveTextContent("PICC Master Key");
    expect(onChange).not.toHaveBeenCalled();
    search("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters by ID and selects the original ID, closing the menu", async () => {
    const { rerender } = render(<form aria-label="Keys"><TextWidget {...props} /></form>);
    openDropdown();
    search("BACKUP-003");
    await waitFor(() => expect(screen.getByRole("dialog"))
      .not.toHaveStyle("pointer-events: none"));
    userEvent.click(screen.getByRole("option", { name: "Backup Master Key" }));
    expect(onChange).toHaveBeenCalledWith("backup-003");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    rerender(<form aria-label="Keys"><TextWidget {...props} value="backup-003" /></form>);
    expect(screen.getByRole("button", { name: /^Key:/ })).toHaveTextContent("Backup Master Key");
    expect(new FormData(screen.getByRole("form", { name: "Keys" })).get("keyId")).toBe("backup-003");
    openDropdown();
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("reports no results and does not submit or select on Enter", () => {
    const submit = jest.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><TextWidget {...props} /></form>);
    openDropdown();
    search("missing");
    expect(screen.getByRole("status")).toHaveTextContent("No matching keys");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    userEvent.type(screen.getByRole("searchbox"), "{enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it("supports keyboard opening, filtering, result navigation and selection", () => {
    render(<TextWidget {...props} />);
    screen.getByRole("button", { name: /^Key:/ }).focus();
    userEvent.keyboard("{arrowdown}");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    search("master");
    userEvent.keyboard("{arrowdown}");
    expect(screen.getByRole("option", { name: "PICC Master Key" })).toHaveFocus();
    userEvent.keyboard("{arrowdown}");
    expect(screen.getByRole("option", { name: "Backup Master Key" })).toHaveFocus();
    userEvent.keyboard("{enter}");
    expect(onChange).toHaveBeenCalledWith("backup-003");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("selects the first match with Enter from search", () => {
    render(<TextWidget {...props} />);
    openDropdown();
    search("access");
    userEvent.keyboard("{enter}");
    expect(onChange).toHaveBeenCalledWith("access-002");
  });

  it("dismisses on Escape and outside click, clearing search without changing selection", () => {
    render(<><TextWidget {...props} /><button>Outside</button></>);
    openDropdown();
    search("missing");
    userEvent.keyboard("{esc}");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Key:/ })).toHaveFocus();
    openDropdown();
    expect(screen.getByRole("searchbox")).toHaveValue("");
    userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("dismisses when tabbing outside the widget", () => {
    render(<><TextWidget {...props} /><button>Outside</button></>);
    openDropdown();
    search("missing");
    userEvent.tab();
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("keeps the nullable option available while filtering", async () => {
    render(<TextWidget {...props} schema={{ ...props.schema, nullable: true }} />);
    openDropdown();
    search("missing");
    await waitFor(() => expect(screen.getByRole("dialog"))
      .not.toHaveStyle("pointer-events: none"));
    userEvent.click(screen.getByRole("option", { name: "No key" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("preserves unknown keys and follows external value updates", () => {
    const { rerender } = render(<TextWidget {...props} value="unknown-004" />);
    expect(screen.getByRole("button", { name: /^Key:/ })).toHaveTextContent("Unknown Key `unknown-004`");
    openDropdown();
    search("UNKNOWN-004");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Unknown Key `unknown-004`");
    rerender(<TextWidget {...props} value="access-002" />);
    expect(screen.getByRole("button", { name: /^Key:/ })).toHaveTextContent("Access Control");
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(["disabled", "readonly"])("prevents opening or selecting when %s", flag => {
    const { rerender } = render(<TextWidget {...props} {...{ [flag]: true }} />);
    expect(screen.getByRole("button")).toBeDisabled();
    userEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    rerender(<TextWidget {...props} />);
    openDropdown();
    rerender(<TextWidget {...props} {...{ [flag]: true }} />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("handles an empty key list and null selection", () => {
    keys.splice(0, keys.length);
    render(<TextWidget {...props} value={null} schema={{ ...props.schema, nullable: true }} />);
    openDropdown();
    expect(screen.getByRole("status")).toHaveTextContent("No matching keys");
    expect(within(screen.getByRole("listbox")).getByRole("option", { name: "No key" }))
      .toHaveAttribute("aria-selected", "true");
  });

  it("does not change ordinary text fields", () => {
    render(<TextWidget {...props} schema={{ type: "string" }} />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("master-001");
  });
});

describe("parameter selection", () => {
  const onChange = jest.fn();
  const props = {
    id: "aid",
    name: "aid",
    label: "Application Id",
    schema: {
      type: ["integer", "string"],
      "x-parameter": true,
      "x-hexinput": true,
      "x-hexlength": 6,
      default: 0,
      minimum: 0,
      maximum: 16777215
    },
    value: 42,
    onChange
  };
  const openParameters = () => userEvent.click(screen.getByRole("button", { name: /^Application Id parameter:/ }));

  beforeEach(() => {
    parameters.push(
      { key: "applicationId", value: 1122867, description: "Access control application" },
      { key: "backupFile", value: 2 }
    );
    onChange.mockClear();
  });
  afterEach(() => parameters.splice(0, parameters.length));

  it("preserves numeric and hexadecimal input until parameter mode is requested", () => {
    render(<TextWidget {...props} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
    expect(screen.getByRole("textbox")).toHaveValue("00002a");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "112233" } });
    expect(onChange).toHaveBeenLastCalledWith(1122867);
    userEvent.click(screen.getByRole("button", { name: "Use parameter" }));
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    userEvent.click(screen.getByRole("button", { name: "Use literal value" }));
    expect(onChange).toHaveBeenLastCalledWith(42);
  });

  it("searches descriptions and selects a reference rather than the parameter value", () => {
    render(<TextWidget {...props} />);
    userEvent.click(screen.getByRole("button", { name: "Use parameter" }));
    openParameters();
    expect(screen.getByRole("searchbox")).toHaveFocus();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ACCESS CONTROL" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("applicationId = 1122867 - Access control application");
    userEvent.keyboard("{enter}");
    expect(onChange).toHaveBeenCalledWith("${applicationId}");
  });

  it("searches keys and values and supports entries without a description", () => {
    render(<TextWidget {...props} value="${applicationId}" />);
    openParameters();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "backup" } });
    expect(screen.getByRole("option")).toHaveTextContent("backupFile = 2");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "1122867" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("applicationId");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves unknown references and follows external updates", () => {
    const { rerender } = render(<TextWidget {...props} value="${missing}" />);
    expect(screen.getByRole("button", { name: /^Application Id parameter:/ }))
      .toHaveTextContent("Unknown parameter ${missing}");
    openParameters();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "missing" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    rerender(<TextWidget {...props} value={16} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(16);
    expect(screen.getByRole("textbox")).toHaveValue("000010");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("restores the schema default when a loaded reference switches to a literal", () => {
    render(<TextWidget {...props} value="${applicationId}" />);
    userEvent.click(screen.getByRole("button", { name: "Use literal value" }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("hides parameter selection when the list is empty without changing the literal", () => {
    parameters.splice(0, parameters.length);
    render(<TextWidget {...props} />);
    expect(screen.queryByRole("button", { name: "Use parameter" })).not.toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
    expect(screen.getByRole("textbox")).toHaveValue("00002a");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves loaded references and allows literal entry with an empty list", () => {
    parameters.splice(0, parameters.length);
    const { rerender } = render(<TextWidget {...props} value="${missing}" />);
    openParameters();
    expect(screen.getByRole("option")).toHaveTextContent("Unknown parameter ${missing}");
    userEvent.keyboard("{esc}");
    userEvent.click(screen.getByRole("button", { name: "Use literal value" }));
    expect(onChange).toHaveBeenCalledWith(0);
    rerender(<TextWidget {...props} value={0} />);
    expect(screen.queryByRole("button", { name: "Use parameter" })).not.toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue(0);
  });

  it("updates parameter availability on rerender and exits an empty picker", () => {
    const { rerender } = render(<TextWidget {...props} />);
    userEvent.click(screen.getByRole("button", { name: "Use parameter" }));
    parameters.splice(0, parameters.length);
    rerender(<TextWidget {...props} />);
    expect(screen.queryByRole("button", { name: "Use parameter" })).not.toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
    expect(onChange).not.toHaveBeenCalled();
    parameters.push({ key: "file", value: 1 });
    rerender(<TextWidget {...props} />);
    expect(screen.getByRole("button", { name: "Use parameter" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(["disabled", "readonly"])("prevents changes when %s", flag => {
    render(<TextWidget {...props} value="${applicationId}" {...{ [flag]: true }} />);
    screen.getAllByRole("button").forEach(button => expect(button).toBeDisabled());
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("action selection", () => {
  const onChange = jest.fn();
  const props = {
    id: "root_firstAction__oneof_select",
    name: "root_firstAction__oneof_select",
    label: "Action",
    schema: { type: "number", default: 0 },
    value: 0,
    disabled: false,
    readonly: false,
    options: {
      enumOptions: [
        { label: "Nothing", value: 0 },
        { label: "MIFARE Classic - Authenticate", value: 1 },
        { label: "DESFire - Read Data", value: 2 }
      ]
    },
    onChange
  };
  const openDropdown = () => userEvent.click(screen.getByRole("button", { name: /^Action:/ }));

  beforeEach(() => onChange.mockClear());

  it("shows a searchable dropdown and filters actions by name", async () => {
    render(<SelectWidget {...props} />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    openDropdown();
    expect(screen.getByRole("searchbox")).toHaveFocus();
    await waitFor(() => expect(screen.getByRole("dialog")).not.toHaveStyle("pointer-events: none"));
    expect(screen.getAllByRole("option")).toHaveLength(3);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "desfire" } });
    expect(screen.getAllByRole("option").map(option => option.textContent))
      .toEqual(["DESFire - Read Data"]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("selects the original one-of option value and closes the dropdown", async () => {
    render(<SelectWidget {...props} />);
    openDropdown();
    await waitFor(() => expect(screen.getByRole("dialog")).not.toHaveStyle("pointer-events: none"));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "authenticate" } });
    userEvent.click(screen.getByRole("option", { name: "MIFARE Classic - Authenticate" }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("keeps ordinary enum selects on the Bootstrap widget", () => {
    render(<SelectWidget
      {...props}
      id="root_forceCardType"
      name="forceCardType"
      schema={{ type: "string" }}
      options={{ enumOptions: [{ label: "MIFARE Classic", value: "Mifare" }] }}
      value="Mifare" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});
