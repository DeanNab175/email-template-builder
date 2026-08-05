import { z } from "zod";
import { BLOCK_TYPES, type EmailBlock, type EmailDocument } from "@/types";
import { blockSchemas } from "./block-schemas";

const blockValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const emailBlockSchema: z.ZodType<EmailBlock> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.enum(BLOCK_TYPES),
    props: z.record(z.string(), blockValueSchema),
    children: z.array(emailBlockSchema).optional(),
  }),
);

export const emailDocumentSchema: z.ZodType<EmailDocument> = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  subject: z.string().max(200),
  preheader: z.string().max(250),
  status: z.enum(["draft", "published"]),
  version: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: z.object({
    width: z.number().min(320).max(800),
    backgroundColor: z.string(),
    contentBackgroundColor: z.string(),
    fontFamily: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-zA-Z0-9\s,'_-]+$/, "Use a valid font name or CSS font stack"),
    textColor: z.string(),
    linkColor: z.string(),
  }),
  blocks: z.array(emailBlockSchema),
});

export function parseEmailDocument(input: unknown): EmailDocument {
  const document = emailDocumentSchema.parse(input);

  const validateBlocks = (blocks: EmailBlock[]) => {
    for (const block of blocks) {
      blockSchemas[block.type].parse(block.props);
      if (block.children) validateBlocks(block.children);
    }
  };

  validateBlocks(document.blocks);
  return document;
}
