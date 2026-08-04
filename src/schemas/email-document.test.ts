import { describe, expect, it } from "vitest";
import { sampleTemplate } from "@/constants/sample-template";
import { starterTemplates } from "@/constants/starter-templates";
import { parseEmailDocument } from "@/schemas";

describe("email document validation", () => {
  it("accepts the production sample", () => {
    expect(parseEmailDocument(sampleTemplate).id).toBe(sampleTemplate.id);
  });

  it("keeps every starter template schema-valid", () => {
    expect(
      starterTemplates.map((template) => parseEmailDocument(template).id),
    ).toHaveLength(2);
  });

  it("enforces image alternative text", () => {
    const document = structuredClone(sampleTemplate);
    document.blocks[0].props.imageAlt = "";

    expect(() => parseEmailDocument(document)).toThrow(/Alt text is required/);
  });

  it("rejects unsafe link protocols", () => {
    const document = structuredClone(sampleTemplate);
    document.blocks[0].props.buttonUrl = "javascript:alert(1)";

    expect(() => parseEmailDocument(document)).toThrow(/http/);
  });
});
