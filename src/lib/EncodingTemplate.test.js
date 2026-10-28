import React from "react";
import { EncodingTemplate } from "./EncodingTemplate";
import { buildNavigationTree } from "./ui-tree";
import renderer, { act } from "react-test-renderer";

const realSchema = require("../json-schema.json");

describe("EncodingTemplate", () => {
  it("renders properly", () => {
    const tree = renderer
      .create(<EncodingTemplate chip="DESFire" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders a tree navigation sidebar", () => {
    const tree = renderer
      .create(<EncodingTemplate chip="DESFire" />)
      .toJSON();

    expect(JSON.stringify(tree)).toContain("Tree navigation");
    expect(JSON.stringify(tree)).not.toContain("Template Properties");
  });

  it("uses the light theme by default and supports an explicit light theme", () => {
    const testRenderer = renderer.create(<EncodingTemplate />);
    expect(testRenderer.toJSON().props["data-theme"]).toBe("light");

    act(() => {
      testRenderer.update(<EncodingTemplate theme="light" />);
    });

    expect(testRenderer.toJSON().props["data-theme"]).toBe("light");
  });

  it("switches themes through props without resetting editor state or adding controls", () => {
    const testRenderer = renderer.create(<EncodingTemplate />);
    const instance = testRenderer.getInstance();
    const lightTree = testRenderer.toJSON();

    act(() => {
      instance.toggleSidebar();
    });
    const state = instance.state;

    act(() => {
      testRenderer.update(<EncodingTemplate theme="dark" />);
    });

    expect(testRenderer.toJSON().props["data-theme"]).toBe("dark");
    expect(instance.state).toBe(state);
    expect(testRenderer.toJSON().props.className).toContain("sidebar-collapsed");

    act(() => {
      instance.toggleSidebar();
    });
    const darkTree = testRenderer.toJSON();
    expect(JSON.stringify(darkTree.children)).toBe(JSON.stringify(lightTree.children));

    act(() => {
      testRenderer.update(<EncodingTemplate theme="light" />);
    });

    expect(JSON.stringify(testRenderer.toJSON())).toBe(JSON.stringify(lightTree));
  });

  it("scopes the theme to each editor instance", () => {
    const testRenderer = renderer.create(
      <div>
        <EncodingTemplate theme="dark" />
        <EncodingTemplate />
      </div>
    );

    expect(testRenderer.toJSON().children.map((child) => child.props["data-theme"]))
      .toEqual(["dark", "light"]);
  });

  it("rejects unsupported themes", () => {
    const instance = new EncodingTemplate({ theme: "sepia" });
    expect(() => instance.render()).toThrow('theme must be "light" or "dark"');
  });

  it("keeps action trigger call actions visible in the navigation tree", () => {
    const schema = {
      type: "object",
      properties: {
        firstAction: {
          type: "object",
          properties: {
            onSuccess: { $ref: "#/definitions/ActionTrigger" },
            onFailure: { $ref: "#/definitions/ActionTrigger" }
          }
        }
      },
      definitions: {
        ActionTrigger: {
          type: "object",
          title: "Action Trigger",
          properties: {
            callActions: {
              type: "array",
              items: {
                type: "object",
                title: "Child Action"
              }
            }
          }
        }
      }
    };

    const value = {
      firstAction: {
        onSuccess: { callActions: [{}] },
        onFailure: { callActions: [{}] }
      }
    };

    const tree = buildNavigationTree(schema, value, [], 0, [], schema);
    const serialized = JSON.stringify(tree);

    expect(serialized.match(/Child Action 1/g)).toHaveLength(2);
    expect(serialized).not.toContain("Run Actions");
  });

  it("keeps action branch ids unique so live updates are applied to the right node", () => {
    const schema = {
      type: "object",
      properties: {
        firstAction: {
          type: "object",
          properties: {
            onSuccess: { $ref: "#/definitions/ActionTrigger" },
            onFailure: { $ref: "#/definitions/ActionTrigger" }
          }
        }
      },
      definitions: {
        ActionTrigger: {
          type: "object",
          title: "Action Trigger",
          properties: {
            callActions: {
              type: "array",
              items: {
                type: "object",
                title: "Child Action"
              }
            }
          }
        }
      }
    };

    const value = {
      firstAction: {
        onSuccess: { callActions: [{}] },
        onFailure: { callActions: [{}] }
      }
    };

    const tree = buildNavigationTree(schema, value, [], 0, [], schema);
    const ids = [];

    const collectIds = (nodes) => {
      nodes.forEach((node) => {
        ids.push(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };

    collectIds(tree);

    expect(ids.filter((id) => id === "root_firstAction")).toHaveLength(1);
    expect(ids).toContain("root_firstAction_onSuccess");
    expect(ids).toContain("root_firstAction_onFailure");
  });

  it("keeps nested trigger children visible in the navigation tree", () => {
    const value = {
      firstAction: {
        $type: "DESFire.SelectApplication",
        label: "Select Root",
        onSuccess: {
          callActions: [
            {
              $type: "DESFire.Authenticate",
              label: "Authenticate",
              onSuccess: {
                callActions: [
                  {
                    $type: "DESFire.WriteData",
                    label: "Nested Write"
                  }
                ]
              }
            }
          ]
        }
      }
    };

    const tree = buildNavigationTree(realSchema, value, [], 0, [], realSchema);
    const serialized = JSON.stringify(tree);

    expect(serialized).toContain("Authenticate");
    expect(serialized).toContain("Nested Write");
    expect(serialized).toContain("root_firstAction_onSuccess_callActions_0_onSuccess_callActions_0");
  });

  it("hides empty trigger sections and tags visible trigger and service nodes with icon kinds", () => {
    const value = {
      firstAction: {
        $type: "DESFire.SelectApplication",
        label: "Select Root",
        onSuccess: {
          callActions: [
            {
              $type: "DESFire.WriteData",
              label: "Write Access Control #1",
              servicesBefore: [
                {
                  $type: "PrepareAccessControlDataService",
                  bufferBehavior: "overwrite",
                  formatDefinition: {
                    $type: "Binary64"
                  }
                }
              ]
            }
          ]
        },
        onFailure: {
          throw: true
        },
        servicesAfter: [
          {
            $type: "CardSerialNumberService",
            bufferBehavior: "doNothing",
            checkCSN: false
          }
        ]
      }
    };

    const tree = buildNavigationTree(realSchema, value, [], 0, [], realSchema);
    const firstAction = tree.find((node) => node.id === "root_firstAction");
    const onSuccessNode = firstAction.children.find((node) => node.id === "root_firstAction_onSuccess");
    const onFailureNode = firstAction.children.find((node) => node.id === "root_firstAction_onFailure");
    const servicesAfterNode = firstAction.children.find((node) => node.id === "root_firstAction_servicesAfter");
    const nestedAction = onSuccessNode.children.find((node) => node.id === "root_firstAction_onSuccess_callActions_0");
    const servicesBeforeNode = nestedAction.children.find((node) => node.id === "root_firstAction_onSuccess_callActions_0_servicesBefore");

    expect(onSuccessNode.kind).toBe("success");
    expect(onFailureNode).toBeUndefined();
    expect(servicesAfterNode.kind).toBe("services-after");
    expect(servicesBeforeNode.kind).toBe("services-before");
  });

  it("rebuilds the navigation tree after form changes", () => {
    const testRenderer = renderer.create(<EncodingTemplate chip="DESFire" />);
    const instance = testRenderer.getInstance();

    act(() => {
      instance.handleFormChange({
        firstAction: {
          onSuccess: { callActions: [{}] },
          onFailure: { callActions: [{}] }
        }
      });
    });

    const treeJson = JSON.stringify(testRenderer.toJSON());
    expect(treeJson).toContain("Tree navigation");
    expect(treeJson).toContain("onSuccess");
  });

  it("keeps the onEdit callback signature stable", () => {
    const onEdit = jest.fn();
    const testRenderer = renderer.create(<EncodingTemplate chip="DESFire" onEdit={onEdit} />);
    const instance = testRenderer.getInstance();
    const changeEvent = {
      formData: {
        firstAction: {
          onSuccess: { callActions: [{}] }
        }
      },
      errors: [{ name: "firstAction" }]
    };

    onEdit.mockClear();

    act(() => {
      instance.handleFormChange(changeEvent);
    });

    expect(onEdit).toHaveBeenCalled();
    expect(onEdit.mock.calls).toEqual(
      expect.arrayContaining([
        [
          expect.objectContaining({
            formData: changeEvent.formData,
            errors: changeEvent.errors
          })
        ]
      ])
    );
  });

  it("refreshes the active tree section when a form element is selected", () => {
    const testRenderer = renderer.create(<EncodingTemplate chip="DESFire" />);
    const instance = testRenderer.getInstance();

    act(() => {
      instance.handleFormChange({
        firstAction: {
          $type: "DESFire.SelectApplication",
          onSuccess: {
            callActions: [
              {
                $type: "DESFire.WriteData",
                label: "Nested action"
              }
            ]
          }
        }
      });
    });

    const firstAction = instance.state.navigation.find((node) => node.id === "root_firstAction");
    const targetSectionId = firstAction.children.find((node) => node.id.includes("onSuccess")).id;

    const container = document.createElement("div");
    const section = document.createElement("div");
    section.id = targetSectionId;
    const input = document.createElement("input");
    input.id = `${targetSectionId}_callActions_0_label`;
    section.appendChild(input);
    container.appendChild(section);
    document.body.appendChild(container);

    act(() => {
      instance.handleFormInteraction({ target: input });
    });

    expect(instance.state.activeSection).toBe(targetSectionId);

    document.body.removeChild(container);
  });

  it("renders concrete DESFire action branches from discriminator-selected schemas", () => {
    const value = {
      forceCardType: "DESFireEV1",
      properties: [],
      firstAction: {
        $type: "DESFire.SelectApplication",
        aid: 0,
        label: "Select Root",
        onSuccess: {
          callActions: [
            {
              $type: "DESFire.Authenticate",
              key: {
                keyId: "b3c7c11d-4bf2-414a-f33f-08dba8bbb74f"
              },
              keyNo: 0,
              label: "Authenticate with PICC Master Key"
            },
            {
              $type: "DESFire.WriteData",
              encryptionMode: "encrypt",
              fileNo: 0,
              label: "Write Access Control #1",
              offset: 0,
              servicesBefore: [
                {
                  $type: "PrepareAccessControlDataService",
                  bufferBehavior: "overwrite",
                  fieldNamePrefix: null,
                  formatDefinition: {
                    $type: "Binary64"
                  }
                }
              ]
            }
          ],
          throw: false
        },
        servicesAfter: [
          {
            $type: "CardSerialNumberService",
            bufferBehavior: "doNothing",
            checkCSN: false,
            fieldNamePrefix: null
          }
        ]
      }
    };

    const tree = buildNavigationTree(realSchema, value, [], 0, [], realSchema);
    const serialized = JSON.stringify(tree);

    expect(serialized).toContain("On Success");
    expect(serialized).toContain("Authenticate with PICC Master Key");
    expect(serialized).toContain("Write Access Control #1");
    expect(serialized).not.toContain("Run Actions");
    expect(serialized).not.toContain("Template Properties");
    expect(serialized).toContain("Services Before");
    expect(serialized).toContain("PrepareAccessControlDataService");
    expect(serialized).toContain("Services After");
    expect(serialized).toContain("CardSerialNumberService");
  });
});