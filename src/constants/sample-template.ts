import type { EmailDocument } from "@/types";

const timestamp = "2026-08-04T08:00:00.000Z";

export const sampleTemplate: EmailDocument = {
  id: "welcome-campaign",
  name: "The Northstar Edit",
  subject: "A considered start to your next campaign",
  preheader: "Fresh ideas, quietly delivered.",
  status: "draft",
  version: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  settings: {
    width: 640,
    backgroundColor: "#f1f5f9",
    contentBackgroundColor: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    textColor: "#334155",
    linkColor: "#4f46e5",
  },
  blocks: [
    {
      id: "hero-intro",
      type: "hero",
      props: {
        eyebrow: "THE NORTHSTAR EDIT / 04",
        title: "Make room for what matters.",
        body: "A collection of thoughtful tools and ideas for teams building their next meaningful thing.",
        buttonText: "Read the new edit",
        buttonUrl: "https://example.com/edit",
        imageUrl:
          "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1280&q=85",
        imageAlt: "Sunlit desks in a calm creative studio",
        overlayColor: "#172554",
        textColor: "#ffffff",
        align: "left",
        height: 440,
      },
    },
    {
      id: "section-letter",
      type: "section",
      props: { backgroundColor: "#ffffff", paddingTop: 44, paddingBottom: 36 },
      children: [
        {
          id: "heading-letter",
          type: "heading",
          props: {
            content: "Built for the work between the work",
            level: "h2",
            fontSize: 30,
            fontWeight: "700",
            color: "#0f172a",
            align: "left",
            lineHeight: 1.2,
            padding: 8,
          },
        },
        {
          id: "text-letter",
          type: "text",
          props: {
            content:
              "The best ideas rarely arrive fully formed. This month, we are sharing a practical field guide to making space for early thinking—and helping it become something real.",
            fontSize: 17,
            fontWeight: "400",
            color: "#475569",
            align: "left",
            lineHeight: 1.7,
            padding: 8,
          },
        },
        {
          id: "button-letter",
          type: "button",
          props: {
            text: "Open the field guide",
            url: "https://example.com/field-guide",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            borderRadius: 8,
            horizontalPadding: 28,
            verticalPadding: 14,
            align: "left",
            target: "_blank",
          },
        },
      ],
    },
    {
      id: "divider-main",
      type: "divider",
      props: { color: "#e2e8f0", thickness: 1, width: 88, padding: 12 },
    },
    {
      id: "columns-features",
      type: "columns",
      props: {
        columnCount: 2,
        gap: 18,
        stackOnMobile: true,
        backgroundColor: "#ffffff",
      },
      children: [
        {
          id: "column-one",
          type: "container",
          props: { backgroundColor: "#f8fafc", padding: 24 },
          children: [
            {
              id: "heading-one",
              type: "heading",
              props: {
                content: "01 / Find the signal",
                level: "h3",
                fontSize: 20,
                fontWeight: "700",
                color: "#0f172a",
                align: "left",
                lineHeight: 1.3,
                padding: 4,
              },
            },
            {
              id: "text-one",
              type: "text",
              props: {
                content:
                  "A simple framework for deciding which early ideas deserve more energy.",
                fontSize: 15,
                fontWeight: "400",
                color: "#64748b",
                align: "left",
                lineHeight: 1.6,
                padding: 4,
              },
            },
          ],
        },
        {
          id: "column-two",
          type: "container",
          props: { backgroundColor: "#f8fafc", padding: 24 },
          children: [
            {
              id: "heading-two",
              type: "heading",
              props: {
                content: "02 / Protect the spark",
                level: "h3",
                fontSize: 20,
                fontWeight: "700",
                color: "#0f172a",
                align: "left",
                lineHeight: 1.3,
                padding: 4,
              },
            },
            {
              id: "text-two",
              type: "text",
              props: {
                content:
                  "Small rituals that give unfinished thinking enough safety to get better.",
                fontSize: 15,
                fontWeight: "400",
                color: "#64748b",
                align: "left",
                lineHeight: 1.6,
                padding: 4,
              },
            },
          ],
        },
      ],
    },
    {
      id: "spacer-before-social",
      type: "spacer",
      props: { height: 28 },
    },
    {
      id: "social-main",
      type: "social",
      props: {
        label: "Keep up with Northstar",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        linkedinUrl: "https://linkedin.com",
        color: "#334155",
        align: "center",
      },
    },
    {
      id: "footer-main",
      type: "footer",
      props: {
        companyName: "Northstar Studio",
        address: "12 Market Street, Port Louis, Mauritius",
        unsubscribeUrl: "https://example.com/unsubscribe",
        backgroundColor: "#0f172a",
        color: "#cbd5e1",
        align: "center",
      },
    },
  ],
};
