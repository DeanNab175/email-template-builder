import { describe, expect, it } from "vitest";
import { sampleTemplate } from "@/constants/sample-template";
import { renderEmailHtml } from "@/lib/email/html-renderer";

describe("HTML email renderer", () => {
  it("generates a complete responsive, table-based email", () => {
    const html = renderEmailHtml(sampleTemplate);

    expect(html).toContain("<!doctype html>");
    expect(html).toContain('role="presentation"');
    expect(html).toContain("@media screen and (max-width:680px)");
    expect(html).toContain("mso-table-lspace");
    expect(html).toContain("v:roundrect");
    expect(html).toContain("Sunlit desks in a calm creative studio");
    expect(html).toContain("Unsubscribe");
  });

  it("escapes authored content", () => {
    const document = structuredClone(sampleTemplate);
    document.blocks[0].props.title = '<script>alert("no")</script>';

    const html = renderEmailHtml(document);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
