import { NextResponse } from "next/server";
import { renderEmailHtml } from "@/lib/email";
import { parseEmailDocument } from "@/schemas";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const document = parseEmailDocument(body);
    return new NextResponse(renderEmailHtml(document), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${document.id}.html"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "The email document is invalid.",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 400 },
    );
  }
}
