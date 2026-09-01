import { NextRequest, NextResponse } from "next/server";
import { fetchAvailableModels } from "@/lib/ai/dynamicModelDiscovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, baseURL } = body;

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    const models = await fetchAvailableModels(provider, apiKey || "", baseURL);
    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to discover models", models: [] },
      { status: 500 }
    );
  }
}
