import { parseEmailDocument } from "@/schemas";
import { getGoogleFontStylesheetUrl } from "@/constants/fonts";
import type { BlockProps, EmailBlock, EmailDocument } from "@/types";

const asString = (value: BlockProps[string]) => String(value ?? "");
const asNumber = (value: BlockProps[string]) => Number(value ?? 0);

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(value: BlockProps[string]) {
  const href = asString(value).trim();
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(href) ? escapeHtml(href) : "#";
}

function copy(value: BlockProps[string]) {
  return escapeHtml(asString(value)).replaceAll("\n", "<br>");
}

function renderButton(props: BlockProps, fontFamily: string) {
  const text = copy(props.text ?? props.buttonText);
  const href = safeHref(props.url ?? props.buttonUrl);
  const backgroundColor = asString(props.backgroundColor ?? "#4f46e5");
  const color = asString(props.color ?? "#ffffff");
  const radius = asNumber(props.borderRadius ?? 8);
  const horizontal = asNumber(props.horizontalPadding ?? 28);
  const vertical = asNumber(props.verticalPadding ?? 14);
  const width = Math.max(
    120,
    asString(props.text ?? props.buttonText).length * 9 + horizontal * 2,
  );
  const target = props.target === "_self" ? "_self" : "_blank";

  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${vertical * 2 + 20}px;v-text-anchor:middle;width:${width}px" arcsize="${Math.min(50, radius * 4)}%" stroke="f" fillcolor="${backgroundColor}">
  <w:anchorlock/><center style="color:${color};font-family:${fontFamily};font-size:16px;font-weight:bold">${text}</center>
</v:roundrect>
<![endif]--><!--[if !mso]><!--><a href="${href}" target="${target}" style="background-color:${backgroundColor};border-radius:${radius}px;color:${color};display:inline-block;font-family:${fontFamily};font-size:16px;font-weight:700;line-height:20px;padding:${vertical}px ${horizontal}px;text-align:center;text-decoration:none;-webkit-text-size-adjust:none">${text}</a><!--<![endif]-->`;
}

function renderChildren(
  children: EmailBlock[] | undefined,
  document: EmailDocument,
  insideFullWidthSection = false,
) {
  return (children ?? [])
    .map((child) => renderBlockHtml(child, document, insideFullWidthSection))
    .join("\n");
}

export function renderBlockHtml(
  block: EmailBlock,
  document: EmailDocument,
  insideFullWidthSection = false,
): string {
  const props = block.props;

  switch (block.type) {
    case "section": {
      const fullWidth = props.fullWidth === true;
      return `<tr>
  <td bgcolor="${asString(props.backgroundColor)}" style="background-color:${asString(props.backgroundColor)};padding:${asNumber(props.paddingTop)}px ${fullWidth ? 0 : 24}px ${asNumber(props.paddingBottom)}px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody>${renderChildren(block.children, document, fullWidth)}</tbody></table>
  </td>
</tr>`;
    }

    case "container":
      return `<tr>
  <td bgcolor="${asString(props.backgroundColor)}" style="background-color:${asString(props.backgroundColor)};padding:${asNumber(props.padding)}px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody>${renderChildren(block.children, document, insideFullWidthSection)}</tbody></table>
  </td>
</tr>`;

    case "heading": {
      const level = ["h1", "h2", "h3"].includes(asString(props.level))
        ? asString(props.level)
        : "h2";
      return `<tr><td style="padding:${asNumber(props.padding)}px;text-align:${asString(props.align)}"><${level} style="color:${asString(props.color)};font-family:${document.settings.fontFamily};font-size:${asNumber(props.fontSize)}px;font-weight:${asString(props.fontWeight)};line-height:${asNumber(props.lineHeight)};margin:0">${copy(props.content)}</${level}></td></tr>`;
    }

    case "text":
      return `<tr><td style="color:${asString(props.color)};font-family:${document.settings.fontFamily};font-size:${asNumber(props.fontSize)}px;font-weight:${asString(props.fontWeight)};line-height:${asNumber(props.lineHeight)};padding:${asNumber(props.padding)}px;text-align:${asString(props.align)}"><p style="margin:0">${copy(props.content)}</p></td></tr>`;

    case "button":
      return `<tr><td style="padding:12px 8px;text-align:${asString(props.align)}">${renderButton(props, document.settings.fontFamily)}</td></tr>`;

    case "image": {
      const maximumWidth = insideFullWidthSection
        ? "100%"
        : `${asNumber(props.width)}px`;
      const image = `<img src="${safeHref(props.src)}" width="${insideFullWidthSection ? document.settings.width : asNumber(props.width)}" alt="${escapeHtml(asString(props.alt))}" border="0" style="border:0;border-radius:${asNumber(props.borderRadius)}px;display:block;height:auto;max-width:${maximumWidth};outline:none;text-decoration:none;width:100%">`;
      const linked = asString(props.linkUrl)
        ? `<a href="${safeHref(props.linkUrl)}" target="_blank">${image}</a>`
        : image;
      return `<tr><td align="${asString(props.align)}" style="padding:0;text-align:${asString(props.align)}">${linked}</td></tr>`;
    }

    case "divider":
      return `<tr><td style="padding:${asNumber(props.padding)}px 8px"><table role="presentation" width="${asNumber(props.width)}%" align="center" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td height="${asNumber(props.thickness)}" style="background:${asString(props.color)};font-size:0;line-height:0">&nbsp;</td></tr></tbody></table></td></tr>`;

    case "spacer":
      return `<tr><td aria-hidden="true" height="${asNumber(props.height)}" style="font-size:0;height:${asNumber(props.height)}px;line-height:${asNumber(props.height)}px">&nbsp;</td></tr>`;

    case "columns": {
      const columns = block.children ?? [];
      const count = Math.max(1, columns.length);
      const width = Math.floor(100 / count);
      const gap = asNumber(props.gap);
      const className = props.stackOnMobile ? "email-column" : "";
      return `<tr><td bgcolor="${asString(props.backgroundColor)}" style="background:${asString(props.backgroundColor)};padding:8px ${Math.floor(gap / 2)}px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr>${columns
        .map(
          (column, index) =>
            `<td class="${className}" width="${width}%" valign="top" style="padding:0 ${Math.ceil(gap / 2)}px${index === count - 1 ? "" : ";mso-padding-alt:0"}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody>${renderBlockHtml(column, document, insideFullWidthSection)}</tbody></table></td>`,
        )
        .join("")}</tr></tbody></table></td></tr>`;
    }

    case "hero": {
      const alignment = asString(props.align);
      const content = `<table role="presentation" width="100%" height="${asNumber(props.height)}" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td valign="middle" style="padding:48px;text-align:${alignment}">
  <p style="color:${asString(props.textColor)};font-family:${document.settings.fontFamily};font-size:12px;font-weight:700;letter-spacing:2px;margin:0 0 14px;text-transform:uppercase">${copy(props.eyebrow)}</p>
  <h1 style="color:${asString(props.textColor)};font-family:${document.settings.fontFamily};font-size:42px;line-height:1.12;margin:0 0 18px">${copy(props.title)}</h1>
  <p style="color:${asString(props.textColor)};font-family:${document.settings.fontFamily};font-size:17px;line-height:1.6;margin:0 0 26px">${copy(props.body)}</p>
  ${renderButton({ ...props, text: props.buttonText, url: props.buttonUrl, backgroundColor: "#ffffff", color: props.overlayColor, borderRadius: 8, horizontalPadding: 28, verticalPadding: 14 }, document.settings.fontFamily)}
</td></tr></tbody></table>`;
      return `<tr><td role="img" aria-label="${escapeHtml(asString(props.imageAlt))}" background="${safeHref(props.imageUrl)}" bgcolor="${asString(props.overlayColor)}" style="background-color:${asString(props.overlayColor)};background-image:linear-gradient(rgba(15,23,42,.58),rgba(15,23,42,.58)),url('${safeHref(props.imageUrl)}');background-position:center;background-size:cover">
<!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${document.settings.width}px;height:${asNumber(props.height)}px"><v:fill type="frame" src="${safeHref(props.imageUrl)}" color="${asString(props.overlayColor)}"/><v:textbox inset="0,0,0,0"><![endif]-->
${content}
<!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
</td></tr>`;
    }

    case "social": {
      const networks = [
        ["Facebook", props.facebookUrl],
        ["Instagram", props.instagramUrl],
        ["LinkedIn", props.linkedinUrl],
      ].filter(([, url]) => Boolean(url));
      return `<tr><td style="padding:24px;text-align:${asString(props.align)}"><p style="color:${asString(props.color)};font-family:${document.settings.fontFamily};font-size:13px;font-weight:700;letter-spacing:.5px;margin:0 0 12px">${copy(props.label)}</p>${networks
        .map(
          ([name, url]) =>
            `<a href="${safeHref(url)}" target="_blank" style="color:${asString(props.color)};display:inline-block;font-family:${document.settings.fontFamily};font-size:13px;margin:0 8px;text-decoration:underline">${name}</a>`,
        )
        .join("")}</td></tr>`;
    }

    case "footer":
      return `<tr><td bgcolor="${asString(props.backgroundColor)}" style="background:${asString(props.backgroundColor)};color:${asString(props.color)};font-family:${document.settings.fontFamily};font-size:12px;line-height:1.7;padding:32px;text-align:${asString(props.align)}"><p style="margin:0 0 6px"><strong>${copy(props.companyName)}</strong></p><p style="margin:0 0 12px">${copy(props.address)}</p><p style="margin:0"><a href="${safeHref(props.unsubscribeUrl)}" style="color:${asString(props.color)};text-decoration:underline">Unsubscribe</a></p></td></tr>`;
  }
}

export interface EmailRenderer {
  render(document: EmailDocument): string;
}

export const htmlEmailRenderer: EmailRenderer = {
  render(document) {
    parseEmailDocument(document);
    const blocks = document.blocks
      .map((block) => renderBlockHtml(block, document))
      .join("\n");
    const preheader = escapeHtml(document.preheader);
    const googleFontStylesheet = getGoogleFontStylesheetUrl(
      document.settings.fontFamily,
    );
    const googleFontLink = googleFontStylesheet
      ? `<link href="${escapeHtml(googleFontStylesheet)}" rel="stylesheet" type="text/css">`
      : "";
    const googleFontImport = googleFontStylesheet
      ? `@import url('${googleFontStylesheet}');`
      : "";

    return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(document.subject || document.name)}</title>
  ${googleFontLink}
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    ${googleFontImport}
    html,body{margin:0!important;padding:0!important;width:100%!important}table,td{border-collapse:collapse!important;mso-table-lspace:0pt!important;mso-table-rspace:0pt!important}img{-ms-interpolation-mode:bicubic}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
    @media screen and (max-width:680px){.email-shell{width:100%!important}.email-column{display:block!important;width:100%!important}.email-column table{width:100%!important}h1{font-size:34px!important}}
    @media (prefers-color-scheme:dark){.dark-body{background:#111827!important}.dark-shell{background:#ffffff!important}}
  </style>
</head>
<body class="dark-body" style="background:${document.settings.backgroundColor};margin:0;padding:0;word-spacing:normal">
  <div style="display:none;font-size:1px;color:${document.settings.backgroundColor};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preheader}&#847;&zwnj;&nbsp;&#8199;&#65279;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${document.settings.backgroundColor}" style="background:${document.settings.backgroundColor}"><tbody><tr><td align="center" style="padding:24px 12px">
    <table class="email-shell dark-shell" role="presentation" width="${document.settings.width}" cellspacing="0" cellpadding="0" border="0" bgcolor="${document.settings.contentBackgroundColor}" style="background:${document.settings.contentBackgroundColor};max-width:${document.settings.width}px;width:100%"><tbody>
${blocks}
    </tbody></table>
  </td></tr></tbody></table>
</body>
</html>`;
  },
};

export function renderEmailHtml(document: EmailDocument) {
  return htmlEmailRenderer.render(document);
}
