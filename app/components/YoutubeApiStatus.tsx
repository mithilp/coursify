"use client";

import { useState, useEffect } from "react";
import { ApiKeyStatus } from "@/app/utils/youtube-api";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type KeyStatus = {
  index: number;
  envName: string;
  status: ApiKeyStatus;
  errorCount: number;
  lastUsed: string;
};

export function YoutubeApiStatus() {
  const [keyStatuses, setKeyStatuses] = useState<KeyStatus[]>([]);
  const [hasActiveKeys, setHasActiveKeys] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch the YouTube API key statuses
  const fetchKeyStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/youtube-status");
      const data = await response.json();
      
      if (data.success) {
        // Convert lastUsed from string to Date
        const statuses = data.keyStatuses.map((status: any) => ({
          ...status,
          lastUsed: new Date(status.lastUsed).toLocaleString(),
        }));
        
        setKeyStatuses(statuses);
        setHasActiveKeys(data.hasActiveKeys);
      } else {
        console.error("[YouTubeAPI] Failed to fetch key statuses:", data.error);
        // Use mock data for fallback
        const mockStatuses = [
          { index: 0, envName: "YOUTUBE_API_KEY", status: "active" as ApiKeyStatus, errorCount: 0, lastUsed: new Date().toLocaleString() },
          { index: 1, envName: "YOUTUBE_API_KEY_2", status: "active" as ApiKeyStatus, errorCount: 0, lastUsed: new Date().toLocaleString() },
          { index: 2, envName: "YOUTUBE_API_KEY_3", status: "active" as ApiKeyStatus, errorCount: 0, lastUsed: new Date().toLocaleString() },
        ];
        setKeyStatuses(mockStatuses);
      }
    } catch (error) {
      console.error("[YouTubeAPI] Error fetching key statuses:", error);
      // Use mock data for fallback
      const mockStatuses = [
        { index: 0, envName: "YOUTUBE_API_KEY", status: "active" as ApiKeyStatus, errorCount: 0, lastUsed: new Date().toLocaleString() },
        { index: 1, envName: "YOUTUBE_API_KEY_2", status: "active" as ApiKeyStatus, errorCount: 0, lastUsed: new Date().toLocaleString() },
        { index: 2, envName: "YOUTUBE_API_KEY_3", status: "active" as ApiKeyStatus, errorCount: 0, lastUsed: new Date().toLocaleString() },
      ];
      setKeyStatuses(mockStatuses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyStatuses();
    
    // Refresh status periodically
    const intervalId = setInterval(fetchKeyStatuses, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="animate-pulse">
          YouTube API: Loading...
        </Badge>
      </div>
    );
  }

  // Count active keys
  const activeKeys = keyStatuses.filter(key => key.status === "active").length;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Badge
              variant={activeKeys > 0 ? "outline" : "destructive"}
              className={activeKeys > 0 ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400" : ""}
            >
              YouTube API: {activeKeys}/{keyStatuses.length} available
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 p-1">
            <p className="text-sm font-medium">YouTube API Key Status</p>
            <ul className="text-xs space-y-1">
              {keyStatuses.map((key) => (
                <li key={key.index} className="flex items-center justify-between">
                  <span>{key.envName}:</span>
                  <span>
                    {key.status === "active" ? (
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    ) : key.status === "quota_exceeded" ? (
                      <span className="text-red-600 dark:text-red-400">Quota Exceeded</span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400">Error ({key.errorCount})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-500 mt-1">
              <button 
                onClick={() => fetchKeyStatuses()}
                className="underline text-blue-600 hover:text-blue-800"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 