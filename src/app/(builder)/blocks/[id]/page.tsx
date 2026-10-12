import type { Metadata } from "next";
import { CustomBlockBuilder } from "@/components/custom-blocks/custom-block-builder";

export const metadata: Metadata = {
  title: "Edit Custom Block | Northstar",
  description: "Edit a reusable custom block for your email templates.",
};

export default async function EditCustomBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomBlockBuilder initialBlockId={id} />;
}
