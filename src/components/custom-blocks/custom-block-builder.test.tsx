import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CustomBlockBuilder } from "@/components/custom-blocks/custom-block-builder";
import { sampleTemplate } from "@/constants/sample-template";
import { useBuilderStore } from "@/store/builder-store";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("custom block studio", () => {
  beforeEach(() => {
    push.mockReset();
    useBuilderStore.setState({
      document: structuredClone(sampleTemplate),
      customBlocks: [],
      selectedBlockId: null,
      past: [],
      future: [],
      isDirty: false,
      historyKey: null,
      historyAt: 0,
    });
  });

  it("authors and saves a custom block without changing the current email", () => {
    const emailBefore = structuredClone(useBuilderStore.getState().document);
    render(<CustomBlockBuilder />);

    fireEvent.change(screen.getByLabelText("Block name"), {
      target: { value: "Product announcement" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Reusable launch content" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add Heading to custom block" }),
    );
    fireEvent.change(screen.getByLabelText("Heading"), {
      target: { value: "Meet the next release" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Save$/ }));

    expect(useBuilderStore.getState().document).toEqual(emailBefore);
    expect(useBuilderStore.getState().customBlocks).toMatchObject([
      {
        name: "Product announcement",
        description: "Reusable launch content",
        block: {
          type: "custom",
          children: [
            {
              type: "heading",
              props: { content: "Meet the next release" },
            },
          ],
        },
      },
    ]);
    expect(
      screen.getByText("Saved “Product announcement” to Your blocks."),
    ).toBeInTheDocument();
  });

  it("requires content before saving", () => {
    render(<CustomBlockBuilder />);

    fireEvent.click(screen.getByRole("button", { name: /^Save$/ }));

    expect(
      screen.getByText("Add at least one building block before saving."),
    ).toBeInTheDocument();
    expect(useBuilderStore.getState().customBlocks).toHaveLength(0);
  });

  it("omits the built-in marketing composites from the studio palette", () => {
    render(<CustomBlockBuilder />);

    expect(
      screen.queryByRole("button", { name: "Add Hero to custom block" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Add Social links to custom block",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add Footer to custom block" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Heading to custom block" }),
    ).toBeInTheDocument();
  });
});
