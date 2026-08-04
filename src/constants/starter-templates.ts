import { sampleTemplate } from "@/constants/sample-template";
import type { EmailDocument } from "@/types";

const timestamp = "2026-08-04T08:00:00.000Z";

export const productLaunchTemplate: EmailDocument = {
  id: "product-launch-starter",
  name: "Product launch",
  subject: "Meet the product built for your next chapter",
  preheader: "A simpler way to move your best work forward.",
  status: "draft",
  version: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  settings: {
    width: 640,
    backgroundColor: "#eef2ff",
    contentBackgroundColor: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    textColor: "#334155",
    linkColor: "#4338ca",
  },
  blocks: [
    {
      id: "launch-hero",
      type: "hero",
      props: {
        eyebrow: "INTRODUCING ORBIT",
        title: "Your best work, finally in motion.",
        body: "One focused place to plan, make, and ship the work your customers are waiting for.",
        buttonText: "See Orbit in action",
        buttonUrl: "https://example.com/orbit",
        imageUrl:
          "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1280&q=85",
        imageAlt: "Team discussing a product launch in a bright meeting room",
        overlayColor: "#312e81",
        textColor: "#ffffff",
        align: "center",
        height: 430,
      },
    },
    {
      id: "launch-section",
      type: "section",
      props: { backgroundColor: "#ffffff", paddingTop: 40, paddingBottom: 40 },
      children: [
        {
          id: "launch-heading",
          type: "heading",
          props: {
            content: "Less process. More progress.",
            level: "h2",
            fontSize: 30,
            fontWeight: "700",
            color: "#1e1b4b",
            align: "center",
            lineHeight: 1.2,
            padding: 8,
          },
        },
        {
          id: "launch-copy",
          type: "text",
          props: {
            content:
              "Orbit brings briefs, decisions, and delivery together—so everyone knows what matters and what happens next.",
            fontSize: 17,
            fontWeight: "400",
            color: "#475569",
            align: "center",
            lineHeight: 1.7,
            padding: 8,
          },
        },
        {
          id: "launch-button",
          type: "button",
          props: {
            text: "Start a free workspace",
            url: "https://example.com/signup",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            borderRadius: 8,
            horizontalPadding: 30,
            verticalPadding: 15,
            align: "center",
            target: "_blank",
          },
        },
      ],
    },
    {
      id: "launch-footer",
      type: "footer",
      props: {
        companyName: "Orbit Labs",
        address: "88 Harbour Road, Port Louis, Mauritius",
        unsubscribeUrl: "https://example.com/unsubscribe",
        backgroundColor: "#1e1b4b",
        color: "#e0e7ff",
        align: "center",
      },
    },
  ],
};

export const starterTemplates = [
  sampleTemplate,
  productLaunchTemplate,
] as const;
