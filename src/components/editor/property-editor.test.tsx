import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyEditor } from "@/components/editor/property-editor";
import { sampleTemplate } from "@/constants/sample-template";
import { useBuilderStore } from "@/store/builder-store";

describe("schema-driven property editor", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      document: structuredClone(sampleTemplate),
      selectedBlockId: "hero-intro",
      past: [],
      future: [],
      isDirty: false,
      historyKey: null,
      historyAt: 0,
    });
  });

  it("renders registry fields and reports Zod validation errors", async () => {
    const user = userEvent.setup();
    render(<PropertyEditor />);

    const altText = screen.getByLabelText("Image description");
    expect(altText).toHaveValue("Sunlit desks in a calm creative studio");
    await user.clear(altText);

    expect(await screen.findByText("Alt text is required")).toBeInTheDocument();
  });

  it("updates the selected block from the color picker", () => {
    useBuilderStore.getState().selectBlock("heading-letter");
    render(<PropertyEditor />);

    fireEvent.change(screen.getByLabelText("Text color color picker"), {
      target: { value: "#2563eb" },
    });

    const section = useBuilderStore
      .getState()
      .document.blocks.find((block) => block.id === "section-letter");
    const heading = section?.children?.find(
      (block) => block.id === "heading-letter",
    );

    expect(heading?.props.color).toBe("#2563eb");
    expect(screen.getByLabelText("Text color hex value")).toHaveValue(
      "#2563eb",
    );
  });

  it("allows an image to expand to the available width", () => {
    const imageId = useBuilderStore.getState().addBlock("image");
    render(<PropertyEditor />);

    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "800" },
    });

    const image = useBuilderStore
      .getState()
      .document.blocks.find((block) => block.id === imageId);

    expect(image?.props.width).toBe(800);
  });

  it("toggles full-width layout for a section", () => {
    useBuilderStore.getState().selectBlock("section-letter");
    render(<PropertyEditor />);

    fireEvent.click(screen.getByLabelText("Full width"));

    const section = useBuilderStore
      .getState()
      .document.blocks.find((block) => block.id === "section-letter");

    expect(section?.props.fullWidth).toBe(true);
  });
});
