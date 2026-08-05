/* eslint-disable @next/next/no-img-element */
import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
} from "react";
import { ExternalLink } from "lucide-react";
import type { EmailBlock } from "@/types";

const text = (value: EmailBlock["props"][string]) => String(value ?? "");
const number = (value: EmailBlock["props"][string]) => Number(value ?? 0);
const FullWidthSectionContext = createContext(false);

export function EmailBlockView({
  block,
  children,
}: {
  block: EmailBlock;
  children?: ReactNode;
}) {
  const props = block.props;
  const align = text(props.align) as CSSProperties["textAlign"];
  const insideFullWidthSection = useContext(FullWidthSectionContext);

  switch (block.type) {
    case "section":
      return (
        <FullWidthSectionContext value={props.fullWidth === true}>
          <div
            className="min-h-18"
            style={{
              backgroundColor: text(props.backgroundColor),
              paddingTop: number(props.paddingTop),
              paddingBottom: number(props.paddingBottom),
              paddingInline: props.fullWidth === true ? 0 : 24,
            }}
          >
            {children}
          </div>
        </FullWidthSectionContext>
      );
    case "container":
      return (
        <div
          className="min-h-16"
          style={{
            backgroundColor: text(props.backgroundColor),
            padding: number(props.padding),
          }}
        >
          {children}
        </div>
      );
    case "heading": {
      const Tag = ["h1", "h2", "h3"].includes(text(props.level))
        ? (text(props.level) as "h1" | "h2" | "h3")
        : "h2";
      return (
        <div style={{ padding: number(props.padding), textAlign: align }}>
          <Tag
            style={{
              color: text(props.color),
              fontSize: number(props.fontSize),
              fontWeight: number(props.fontWeight),
              lineHeight: number(props.lineHeight),
              margin: 0,
            }}
          >
            {text(props.content)}
          </Tag>
        </div>
      );
    }
    case "text":
      return (
        <p
          style={{
            color: text(props.color),
            fontSize: number(props.fontSize),
            fontWeight: number(props.fontWeight),
            lineHeight: number(props.lineHeight),
            margin: 0,
            padding: number(props.padding),
            textAlign: align,
            whiteSpace: "pre-wrap",
          }}
        >
          {text(props.content)}
        </p>
      );
    case "button":
      return (
        <div style={{ padding: 12, textAlign: align }}>
          <span
            className="inline-flex items-center gap-2 font-bold"
            style={{
              background: text(props.backgroundColor),
              borderRadius: number(props.borderRadius),
              color: text(props.color),
              padding: `${number(props.verticalPadding)}px ${number(props.horizontalPadding)}px`,
            }}
          >
            {text(props.text)} <ExternalLink className="size-3.5 opacity-60" />
          </span>
        </div>
      );
    case "image":
      return (
        <div style={{ textAlign: align }}>
          <img
            src={text(props.src)}
            alt={text(props.alt)}
            style={{
              borderRadius: number(props.borderRadius),
              display: "inline-block",
              height: "auto",
              maxWidth: insideFullWidthSection ? "100%" : number(props.width),
              width: "100%",
            }}
          />
        </div>
      );
    case "divider":
      return (
        <div style={{ padding: `${number(props.padding)}px 8px` }}>
          <div
            style={{
              background: text(props.color),
              height: number(props.thickness),
              margin: "auto",
              width: `${number(props.width)}%`,
            }}
          />
        </div>
      );
    case "spacer":
      return (
        <div
          className="flex items-center justify-center text-[9px] font-bold tracking-widest text-slate-300 uppercase"
          style={{ height: number(props.height) }}
        >
          {number(props.height)} px
        </div>
      );
    case "columns":
      return (
        <div
          className="grid min-h-24"
          style={{
            backgroundColor: text(props.backgroundColor),
            gap: number(props.gap),
            gridTemplateColumns: `repeat(${number(props.columnCount)}, minmax(0, 1fr))`,
            padding: 8,
          }}
        >
          {children}
        </div>
      );
    case "hero":
      return (
        <div
          role="img"
          aria-label={text(props.imageAlt)}
          className="relative flex overflow-hidden bg-cover bg-center"
          style={{
            backgroundColor: text(props.overlayColor),
            backgroundImage: `url("${text(props.imageUrl)}")`,
            minHeight: number(props.height),
          }}
        >
          <div className="absolute inset-0 bg-slate-950/55" />
          <div
            className="relative z-10 my-auto w-full p-12"
            style={{ color: text(props.textColor), textAlign: align }}
          >
            <p className="mb-3 text-[11px] font-bold tracking-[0.2em] uppercase">
              {text(props.eyebrow)}
            </p>
            <h1 className="mb-4 text-[42px] leading-[1.12] font-bold tracking-[-0.025em]">
              {text(props.title)}
            </h1>
            <p className="mb-6 text-[17px] leading-relaxed opacity-90">
              {text(props.body)}
            </p>
            <span
              className="inline-block rounded-lg bg-white px-7 py-3.5 text-sm font-bold"
              style={{ color: text(props.overlayColor) }}
            >
              {text(props.buttonText)}
            </span>
          </div>
        </div>
      );
    case "social":
      return (
        <div
          className="p-6"
          style={{ color: text(props.color), textAlign: align }}
        >
          <p className="mb-3 text-xs font-bold tracking-wide">
            {text(props.label)}
          </p>
          <div className="flex justify-center gap-2">
            {["f", "ig", "in"].map((network) => (
              <span
                key={network}
                className="inline-flex size-8 items-center justify-center rounded-full border border-current text-[10px] font-bold uppercase"
              >
                {network}
              </span>
            ))}
          </div>
        </div>
      );
    case "footer":
      return (
        <footer
          className="p-8 text-xs leading-5"
          style={{
            backgroundColor: text(props.backgroundColor),
            color: text(props.color),
            textAlign: align,
          }}
        >
          <p className="font-bold">{text(props.companyName)}</p>
          <p>{text(props.address)}</p>
          <p className="mt-2 underline">Unsubscribe</p>
        </footer>
      );
  }
}
