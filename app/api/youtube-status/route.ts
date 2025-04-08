import { youtubeApiKeyManager } from "@/app/utils/youtube-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the key statuses from the YouTube API key manager
    const keyStatuses = youtubeApiKeyManager.getKeyStatuses();
    
    // Return the key statuses as JSON
    return NextResponse.json({
      success: true,
      keyStatuses,
      hasActiveKeys: youtubeApiKeyManager.hasActiveKeys(),
    });
  } catch (error) {
    console.error("[YouTubeAPI] Error fetching API key statuses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get YouTube API key statuses",
      },
      { status: 500 }
    );
  }
} 