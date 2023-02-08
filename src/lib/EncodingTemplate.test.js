import React from "react";
import EncodingTemplate from "./EncodingTemplate";
import renderer from "react-test-renderer";

describe("EncodingTemplate", () => {
  it("renders properly", () => {
    const tree = renderer
      .create(<EncodingTemplate chip="DESFire" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});