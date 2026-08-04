export const BLOCK_TYPES = [
  "section",
  "container",
  "text",
  "heading",
  "button",
  "image",
  "divider",
  "spacer",
  "columns",
  "hero",
  "social",
  "footer",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type BlockValue = string | number | boolean;
export type BlockProps = Record<string, BlockValue>;

export interface EmailBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
  children?: EmailBlock[];
}

export type TemplateStatus = "draft" | "published";
export type PreviewMode = "desktop" | "mobile";
export type EmailClient = "gmail" | "outlook" | "apple-mail";
export type BuilderSurface = "design" | "preview";

export interface EmailSettings {
  width: number;
  backgroundColor: string;
  contentBackgroundColor: string;
  fontFamily: string;
  textColor: string;
  linkColor: string;
}

export interface EmailDocument {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  status: TemplateStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  settings: EmailSettings;
  blocks: EmailBlock[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  status: TemplateStatus;
  updatedAt: string;
}

export type PropertyFieldKind =
  "text" | "textarea" | "url" | "number" | "color" | "select" | "range";

export interface PropertyOption {
  label: string;
  value: string | number;
}

export interface PropertyField {
  key: string;
  label: string;
  kind: PropertyFieldKind;
  group: "Content" | "Typography" | "Layout" | "Appearance" | "Link";
  placeholder?: string;
  help?: string;
  options?: PropertyOption[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  category: "Structure" | "Content" | "Marketing";
  acceptsChildren: boolean;
  defaultProps: BlockProps;
  fields: PropertyField[];
}

export interface BlockLocation {
  block: EmailBlock;
  parentId: string | null;
  index: number;
}
