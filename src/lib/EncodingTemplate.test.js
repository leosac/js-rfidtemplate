import React from "react";
import { EncodingTemplate } from "./EncodingTemplate";
import { buildNavigationTree } from "./ui-tree";
import renderer from "react-test-renderer";

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
  });
});