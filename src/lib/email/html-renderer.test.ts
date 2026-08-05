import { describe, expect, it } from "vitest";
import { sampleTemplate } from "@/constants/sample-template";
import { createBlock } from "@/features/rendering/block-factory";
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

  it("renders images without spacing that prevents full-width sizing", () => {
    const document = structuredClone(sampleTemplate);
    const image = createBlock("image");
    image.props.width = 800;
    document.blocks = [image];

    const html = renderEmailHtml(document);

    expect(html).toContain("max-width:800px");
    expect(html).toContain("width:100%");
    expect(html).toContain('style="padding:0;text-align:center"');
  });

  it("removes section gutters and image width caps in full-width mode", () => {
    const document = structuredClone(sampleTemplate);
    const section = createBlock("section");
    const image = createBlock("image");
    section.props.fullWidth = true;
    image.props.width = 600;
    section.children = [image];
    document.blocks = [section];

    const html = renderEmailHtml(document);

    expect(html).toContain("padding:24px 0px 24px");
    expect(html).toContain(`width="${document.settings.width}"`);
    expect(html).toContain("max-width:100%");
    expect(html).not.toContain("max-width:600px");
  });
});
