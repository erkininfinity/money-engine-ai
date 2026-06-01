import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookUrl, payload } = body;

    if (!webhookUrl || typeof webhookUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid webhookUrl parameter" },
        { status: 400 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: "Missing payload data" },
        { status: 400 }
      );
    }

    // Forward the request to the configured Webhook URL
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      return NextResponse.json(
        {
          error: `Webhook target returned error status ${response.status}`,
          details: responseText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error forwarding webhook request:", error);
    return NextResponse.json(
      { error: "Failed to forward webhook request", message: error.message },
      { status: 500 }
    );
  }
}
