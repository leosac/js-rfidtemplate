/* eslint-disable no-template-curly-in-string -- Tests use literal parameter references. */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import validator from "@rjsf/validator-ajv8";
import { EncodingTemplate, parameters } from "./index";
import schema from "../json-schema.json";

const parameterFields = Object.entries(schema.definitions).flatMap(([definition, value]) =>
  Object.entries(value.properties || {})
    .filter(([, field]) => field["x-parameter"])
    .map(([name, field]) => [definition + "." + name, field])
);

describe("parameter schema compatibility", () => {
  it("limits parameter references to every DESFire AID and file number field", () => {
    const expected = Object.entries(schema.definitions).flatMap(([definition, value]) =>
      Object.keys(value.properties || {})
        .filter(name => definition.startsWith("DESFire.")
          && ["aid", "fileNo", "sourceFileNo", "targetFileNo"].includes(name))
        .map(name => definition + "." + name)
    );
    expect(parameterFields.map(([name]) => name)).toEqual(expected);
    expect(expected).toHaveLength(15);
  });

  it.each(parameterFields)("%s accepts integers or complete references, retaining its limits", (_, field) => {
    const validNumber = field.default === undefined ? (field.minimum || 0) : field.default;
    for (const value of [validNumber, "${applicationId}", "${notInTheList}"]) {
      expect(validator.validateFormData(value, field).errors).toEqual([]);
    }
    const invalidValues = [
      "123", "", "text", "${}", "${unfinished", "prefix ${key}", 1.5, {}, true,
      ...(field.minimum === undefined ? [] : [field.minimum - 1]),
      ...(field.maximum === undefined ? [] : [field.maximum + 1])
    ];
    for (const value of invalidValues) {
      expect(validator.validateFormData(value, field).errors.length).toBeGreaterThan(0);
    }
  });

  it("keeps other number and text schemas unchanged", () => {
    const fields = schema.definitions["DESFire.ReadData"].properties;
    expect(validator.validateFormData("${offset}", fields.offset).errors.length).toBeGreaterThan(0);
    expect(fields.offset.type).toBe("integer");
    expect(schema.definitions.ActionTrigger.properties.throwCustomMessage.type).toBe("string");
  });
});

describe("parameter references through the editor", () => {
  afterEach(() => parameters.splice(0, parameters.length));

  it("round-trips nested references and emits numeric literals without string coercion", () => {
    parameters.push({ key: "applicationId", value: 1122867, description: "Access control" });
    const onEdit = jest.fn();
    const content = {
      firstAction: {
        $type: "DESFire.SelectApplication",
        aid: "${applicationId}",
        onSuccess: { callActions: [{ $type: "DESFire.ReadData", fileNo: "${file}" }] }
      }
    };
    render(<EncodingTemplate content={JSON.stringify(content)} onEdit={onEdit} />);
    expect(screen.getByRole("button", { name: /^Application Id parameter:/ })).toHaveTextContent("Access control");
    expect(screen.getByRole("button", { name: /^File No parameter:/ })).toHaveTextContent("${file}");
    fireEvent.click(screen.getAllByRole("button", { name: "Use literal value" })[0]);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Application Id" }), { target: { value: "123" } });
    const edited = onEdit.mock.calls[onEdit.mock.calls.length - 1][0].formData;
    expect(edited.firstAction.aid).toBe(123);
    expect(edited.firstAction.onSuccess.callActions[0].fileNo).toBe("${file}");
    fireEvent.click(screen.getByRole("button", { name: "Use parameter" }));
    fireEvent.click(screen.getByRole("button", { name: /^Application Id parameter:/ }));
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });
    const referenced = onEdit.mock.calls[onEdit.mock.calls.length - 1][0].formData;
    expect(referenced.firstAction.aid).toBe("${applicationId}");
    expect(JSON.parse(JSON.stringify(referenced)).firstAction.aid).toBe("${applicationId}");
    expect(validator.validateFormData(referenced.firstAction.aid,
      schema.definitions["DESFire.SelectApplication"].properties.aid).errors).toEqual([]);
  });
});
