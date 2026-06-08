import React from "react";
import { ReviewScreen } from "../src/screens/ReviewScreen";
import { createEmptyApplication } from "../src/store/kycDomain";

const renderer: {
  act: (callback: () => void | Promise<void>) => Promise<void>;
  create: (element: React.ReactElement) => {
    root: {
      findAllByProps: (props: Record<string, unknown>) => unknown[];
    };
  };
} = require("react-test-renderer");

describe("ReviewScreen", () => {
  it("shows submit failures so retry is visible", async () => {
    let tree:
      | {
          root: {
            findAllByProps: (props: Record<string, unknown>) => unknown[];
          };
        }
      | undefined;

    await renderer.act(async () => {
      tree = renderer.create(
        <ReviewScreen
          application={{
            ...createEmptyApplication(),
            status: "draft",
            personalInfo: {
              legalName: "Jane Doe",
              dateOfBirth: "1990-01-01",
              nationality: "UAE",
            },
            address: {
              country: "UAE",
              city: "Dubai",
              line1: "Marina",
            },
            document: {
              type: "passport",
              documentNumber: "FAIL-SUBMIT-123",
            },
          }}
          error="The fake KYC service failed before accepting the submission."
          onBack={() => {}}
          onSubmit={() => {}}
        />,
      );
    });

    expect(
      tree?.root.findAllByProps({ children: "Submission failed" }).length,
    ).toBeGreaterThan(0);
  });
});
