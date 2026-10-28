import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import rawUserEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { keys, uiWidgets } from "./ui-widgets";

const TextWidget = uiWidgets.TextWidget;
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
