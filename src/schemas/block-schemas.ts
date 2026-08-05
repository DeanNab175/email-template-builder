import { z } from "zod";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color");
const safeUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^(https?:\/\/|mailto:|tel:|#)/i.test(value),
    "Use an http(s), mailto, tel, or anchor URL",
  );
const alignment = z.enum(["left", "center", "right"]);

export const blockSchemas = {
  section: z.object({
    backgroundColor: color,
    fullWidth: z.boolean().optional(),
    paddingTop: z.coerce.number().min(0).max(120),
    paddingBottom: z.coerce.number().min(0).max(120),
  }),
  container: z.object({
    backgroundColor: color,
    padding: z.coerce.number().min(0).max(80),
  }),
  text: z.object({
    content: z.string().min(1, "Text is required").max(5000),
    fontSize: z.coerce.number().min(10).max(72),
    fontWeight: z.enum(["400", "500", "600", "700"]),
    color,
    align: alignment,
    lineHeight: z.coerce.number().min(1).max(2.5),
    padding: z.coerce.number().min(0).max(80),
  }),
  heading: z.object({
    content: z.string().min(1, "Heading is required").max(300),
    level: z.enum(["h1", "h2", "h3"]),
    fontSize: z.coerce.number().min(16).max(72),
    fontWeight: z.enum(["500", "600", "700"]),
    color,
    align: alignment,
    lineHeight: z.coerce.number().min(1).max(2),
    padding: z.coerce.number().min(0).max(80),
  }),
  button: z.object({
    text: z.string().min(1, "Button text is required").max(100),
    url: safeUrl.refine((value) => value.length > 0, "URL is required"),
    backgroundColor: color,
    color,
    borderRadius: z.coerce.number().min(0).max(40),
    horizontalPadding: z.coerce.number().min(8).max(60),
    verticalPadding: z.coerce.number().min(6).max(32),
    align: alignment,
    target: z.enum(["_blank", "_self"]),
  }),
  image: z.object({
    src: safeUrl.refine((value) => value.length > 0, "Image URL is required"),
    alt: z.string().trim().min(1, "Alt text is required").max(250),
    width: z.coerce.number().min(40).max(1200),
    align: alignment,
    linkUrl: safeUrl,
    borderRadius: z.coerce.number().min(0).max(40),
  }),
  divider: z.object({
    color,
    thickness: z.coerce.number().min(1).max(12),
    width: z.coerce.number().min(10).max(100),
    padding: z.coerce.number().min(0).max(80),
  }),
  spacer: z.object({
    height: z.coerce.number().min(4).max(200),
  }),
  columns: z.object({
    columnCount: z.coerce.number().int().min(2).max(3),
    gap: z.coerce.number().min(0).max(48),
    stackOnMobile: z.boolean(),
    backgroundColor: color,
  }),
  hero: z.object({
    eyebrow: z.string().max(80),
    title: z.string().min(1, "Title is required").max(240),
    body: z.string().max(1200),
    buttonText: z.string().min(1).max(100),
    buttonUrl: safeUrl.refine((value) => value.length > 0, "URL is required"),
    imageUrl: safeUrl.refine(
      (value) => value.length > 0,
      "Image URL is required",
    ),
    imageAlt: z.string().trim().min(1, "Alt text is required").max(250),
    overlayColor: color,
    textColor: color,
    align: alignment,
    height: z.coerce.number().min(240).max(700),
  }),
  social: z.object({
    label: z.string().min(1).max(120),
    facebookUrl: safeUrl,
    instagramUrl: safeUrl,
    linkedinUrl: safeUrl,
    color,
    align: alignment,
  }),
  footer: z.object({
    companyName: z.string().min(1).max(150),
    address: z.string().min(1).max(250),
    unsubscribeUrl: safeUrl.refine(
      (value) => value.length > 0,
      "URL is required",
    ),
    backgroundColor: color,
    color,
    align: alignment,
  }),
} as const;

export type BlockSchemaMap = typeof blockSchemas;
