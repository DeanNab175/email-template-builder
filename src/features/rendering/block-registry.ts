import type { BlockDefinition, BlockType, PropertyField } from "@/types";

const field = (
  key: string,
  label: string,
  kind: PropertyField["kind"],
  group: PropertyField["group"],
  rest: Partial<PropertyField> = {},
): PropertyField => ({ key, label, kind, group, ...rest });

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  section: {
    type: "section",
    label: "Section",
    description: "Full-width content band",
    category: "Structure",
    acceptsChildren: true,
    defaultProps: {
      backgroundColor: "#ffffff",
      fullWidth: false,
      paddingTop: 24,
      paddingBottom: 24,
    },
    fields: [
      field("backgroundColor", "Background", "color", "Appearance"),
      field("fullWidth", "Full width", "checkbox", "Layout", {
        help: "Remove the side gutters and let images span the section.",
      }),
      field("paddingTop", "Top spacing", "range", "Layout", {
        min: 0,
        max: 120,
      }),
      field("paddingBottom", "Bottom spacing", "range", "Layout", {
        min: 0,
        max: 120,
      }),
    ],
  },
  container: {
    type: "container",
    label: "Container",
    description: "Padded group for nested blocks",
    category: "Structure",
    acceptsChildren: true,
    defaultProps: { backgroundColor: "#ffffff", padding: 20 },
    fields: [
      field("backgroundColor", "Background", "color", "Appearance"),
      field("padding", "Inner spacing", "range", "Layout", { min: 0, max: 80 }),
    ],
  },
  text: {
    type: "text",
    label: "Text",
    description: "Paragraph or body copy",
    category: "Content",
    acceptsChildren: false,
    defaultProps: {
      content: "Write something meaningful for your audience.",
      fontSize: 16,
      fontWeight: "400",
      color: "#475569",
      align: "left",
      lineHeight: 1.6,
      padding: 8,
    },
    fields: [
      field("content", "Content", "textarea", "Content", { required: true }),
      field("fontSize", "Font size", "range", "Typography", {
        min: 10,
        max: 40,
      }),
      field("fontWeight", "Weight", "select", "Typography", {
        options: ["400", "500", "600", "700"].map((value) => ({
          label: value,
          value,
        })),
      }),
      field("color", "Text color", "color", "Typography"),
      field("align", "Alignment", "select", "Typography", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
      field("lineHeight", "Line height", "range", "Typography", {
        min: 1,
        max: 2.5,
        step: 0.1,
      }),
      field("padding", "Spacing", "range", "Layout", { min: 0, max: 80 }),
    ],
  },
  heading: {
    type: "heading",
    label: "Heading",
    description: "Accessible content heading",
    category: "Content",
    acceptsChildren: false,
    defaultProps: {
      content: "A clear, compelling headline",
      level: "h2",
      fontSize: 32,
      fontWeight: "700",
      color: "#0f172a",
      align: "left",
      lineHeight: 1.2,
      padding: 8,
    },
    fields: [
      field("content", "Heading", "text", "Content", { required: true }),
      field("level", "Semantic level", "select", "Content", {
        options: ["h1", "h2", "h3"].map((value) => ({
          label: value.toUpperCase(),
          value,
        })),
      }),
      field("fontSize", "Font size", "range", "Typography", {
        min: 16,
        max: 72,
      }),
      field("fontWeight", "Weight", "select", "Typography", {
        options: ["500", "600", "700"].map((value) => ({
          label: value,
          value,
        })),
      }),
      field("color", "Text color", "color", "Typography"),
      field("align", "Alignment", "select", "Typography", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
      field("lineHeight", "Line height", "range", "Typography", {
        min: 1,
        max: 2,
        step: 0.1,
      }),
      field("padding", "Spacing", "range", "Layout", { min: 0, max: 80 }),
    ],
  },
  button: {
    type: "button",
    label: "Button",
    description: "Outlook-safe call to action",
    category: "Content",
    acceptsChildren: false,
    defaultProps: {
      text: "Explore now",
      url: "https://example.com",
      backgroundColor: "#4f46e5",
      color: "#ffffff",
      borderRadius: 8,
      horizontalPadding: 28,
      verticalPadding: 14,
      align: "left",
      target: "_blank",
    },
    fields: [
      field("text", "Label", "text", "Content", { required: true }),
      field("url", "Destination URL", "url", "Link", { required: true }),
      field("target", "Open link", "select", "Link", {
        options: [
          { label: "New window", value: "_blank" },
          { label: "Same window", value: "_self" },
        ],
      }),
      field("backgroundColor", "Button color", "color", "Appearance"),
      field("color", "Text color", "color", "Appearance"),
      field("borderRadius", "Corner radius", "range", "Appearance", {
        min: 0,
        max: 40,
      }),
      field("horizontalPadding", "Horizontal padding", "range", "Layout", {
        min: 8,
        max: 60,
      }),
      field("verticalPadding", "Vertical padding", "range", "Layout", {
        min: 6,
        max: 32,
      }),
      field("align", "Alignment", "select", "Layout", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
    ],
  },
  image: {
    type: "image",
    label: "Image",
    description: "Responsive image with alt text",
    category: "Content",
    acceptsChildren: false,
    defaultProps: {
      src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      alt: "A bright modern workspace",
      width: 600,
      align: "center",
      linkUrl: "",
      borderRadius: 0,
    },
    fields: [
      field("src", "Image URL", "url", "Content", { required: true }),
      field("alt", "Alt text", "text", "Content", {
        required: true,
        help: "Required for accessibility and image-blocked clients.",
      }),
      field("linkUrl", "Link URL", "url", "Link"),
      field("width", "Width", "range", "Layout", { min: 40, max: 800 }),
      field("align", "Alignment", "select", "Layout", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
      field("borderRadius", "Corner radius", "range", "Appearance", {
        min: 0,
        max: 40,
      }),
    ],
  },
  divider: {
    type: "divider",
    label: "Divider",
    description: "Email-safe horizontal rule",
    category: "Content",
    acceptsChildren: false,
    defaultProps: { color: "#e2e8f0", thickness: 1, width: 100, padding: 16 },
    fields: [
      field("color", "Line color", "color", "Appearance"),
      field("thickness", "Thickness", "range", "Appearance", {
        min: 1,
        max: 12,
      }),
      field("width", "Width", "range", "Layout", { min: 10, max: 100 }),
      field("padding", "Spacing", "range", "Layout", { min: 0, max: 80 }),
    ],
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    description: "Predictable vertical whitespace",
    category: "Content",
    acceptsChildren: false,
    defaultProps: { height: 32 },
    fields: [
      field("height", "Height", "range", "Layout", { min: 4, max: 200 }),
    ],
  },
  columns: {
    type: "columns",
    label: "Columns",
    description: "Two or three responsive columns",
    category: "Structure",
    acceptsChildren: true,
    defaultProps: {
      columnCount: 2,
      gap: 16,
      stackOnMobile: true,
      backgroundColor: "#ffffff",
    },
    fields: [
      field("columnCount", "Columns", "select", "Layout", {
        options: [
          { label: "2 columns", value: 2 },
          { label: "3 columns", value: 3 },
        ],
      }),
      field("gap", "Column gap", "range", "Layout", { min: 0, max: 48 }),
      field("backgroundColor", "Background", "color", "Appearance"),
    ],
  },
  hero: {
    type: "hero",
    label: "Hero",
    description: "Image-led campaign header",
    category: "Marketing",
    acceptsChildren: false,
    defaultProps: {
      eyebrow: "NEW COLLECTION",
      title: "Design a message people remember",
      body: "Create useful, personal email experiences with a beautifully simple workflow.",
      buttonText: "Discover the collection",
      buttonUrl: "https://example.com",
      imageUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Creative team collaborating around a table",
      overlayColor: "#172554",
      textColor: "#ffffff",
      align: "center",
      height: 420,
    },
    fields: [
      field("eyebrow", "Eyebrow", "text", "Content"),
      field("title", "Title", "textarea", "Content", { required: true }),
      field("body", "Body", "textarea", "Content"),
      field("buttonText", "Button label", "text", "Content", {
        required: true,
      }),
      field("buttonUrl", "Button URL", "url", "Link", { required: true }),
      field("imageUrl", "Background image", "url", "Content", {
        required: true,
      }),
      field("imageAlt", "Image description", "text", "Content", {
        required: true,
      }),
      field("overlayColor", "Fallback color", "color", "Appearance"),
      field("textColor", "Text color", "color", "Appearance"),
      field("align", "Alignment", "select", "Layout", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
      field("height", "Height", "range", "Layout", { min: 240, max: 700 }),
    ],
  },
  social: {
    type: "social",
    label: "Social links",
    description: "Accessible social destinations",
    category: "Marketing",
    acceptsChildren: false,
    defaultProps: {
      label: "Follow our story",
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com",
      linkedinUrl: "https://linkedin.com",
      color: "#334155",
      align: "center",
    },
    fields: [
      field("label", "Label", "text", "Content", { required: true }),
      field("facebookUrl", "Facebook URL", "url", "Link"),
      field("instagramUrl", "Instagram URL", "url", "Link"),
      field("linkedinUrl", "LinkedIn URL", "url", "Link"),
      field("color", "Color", "color", "Appearance"),
      field("align", "Alignment", "select", "Layout", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
    ],
  },
  footer: {
    type: "footer",
    label: "Footer",
    description: "Compliant company footer",
    category: "Marketing",
    acceptsChildren: false,
    defaultProps: {
      companyName: "Northstar Studio",
      address: "12 Market Street, Port Louis",
      unsubscribeUrl: "https://example.com/unsubscribe",
      backgroundColor: "#0f172a",
      color: "#cbd5e1",
      align: "center",
    },
    fields: [
      field("companyName", "Company", "text", "Content", { required: true }),
      field("address", "Physical address", "textarea", "Content", {
        required: true,
      }),
      field("unsubscribeUrl", "Unsubscribe URL", "url", "Link", {
        required: true,
      }),
      field("backgroundColor", "Background", "color", "Appearance"),
      field("color", "Text color", "color", "Appearance"),
      field("align", "Alignment", "select", "Layout", {
        options: ["left", "center", "right"].map((value) => ({
          label: value,
          value,
        })),
      }),
    ],
  },
};

export const blockDefinitions = Object.values(blockRegistry);
