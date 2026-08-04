import { emailDocumentSchema } from "@/schemas";
import { createId } from "@/lib/utils/id";
import type { EmailDocument, TemplateSummary } from "@/types";

const STORAGE_KEY = "northstar-email-templates-v1";
const MAX_TEMPLATES = 50;

function read(): EmailDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    return emailDocumentSchema.array().parse(JSON.parse(value));
  } catch {
    return [];
  }
}

function write(documents: EmailDocument[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(documents.slice(0, MAX_TEMPLATES)),
  );
}

export const templateRepository = {
  async list(): Promise<TemplateSummary[]> {
    return read()
      .map(({ id, name, status, updatedAt }) => ({
        id,
        name,
        status,
        updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async get(id: string): Promise<EmailDocument | undefined> {
    return read().find((document) => document.id === id);
  },

  async save(document: EmailDocument): Promise<EmailDocument> {
    const saved = emailDocumentSchema.parse(document);
    const documents = read().filter((item) => item.id !== saved.id);
    write([saved, ...documents]);
    return saved;
  },

  async duplicate(id: string): Promise<EmailDocument> {
    const source = await this.get(id);
    if (!source) throw new Error("Template not found");
    const now = new Date().toISOString();
    const duplicate: EmailDocument = {
      ...structuredClone(source),
      id: createId("template"),
      name: `${source.name} copy`,
      status: "draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    write([duplicate, ...read()]);
    return duplicate;
  },

  async delete(id: string): Promise<void> {
    write(read().filter((document) => document.id !== id));
  },
};
