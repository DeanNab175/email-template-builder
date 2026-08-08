import type { Metadata } from "next";
import { CustomBlockBuilder } from "@/components/custom-blocks/custom-block-builder";

export const metadata: Metadata = {
  title: "Custom Block Studio | Northstar",
  description: "Build reusable custom blocks for your email templates.",
};

export default function CustomBlocksPage() {
  return <CustomBlockBuilder />;
}
