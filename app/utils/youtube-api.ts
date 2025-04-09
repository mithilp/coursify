/**
 * YouTube API key management utility
 * Handles key rotation and quota limit tracking
 */

// Enum for API key status
export enum ApiKeyStatus {
  ACTIVE = "active", // Key is working normally
  QUOTA_EXCEEDED = "quota_exceeded", // Key has hit its quota limit
  ERROR = "error", // Key has other errors
}

// API key data structure
interface ApiKeyData {
  key: string;
  envName: string; // Add environment variable name
  status: ApiKeyStatus;
  lastUsed: Date;
  errorCount: number;
  lastError?: string;
}

// Error types
export enum YouTubeApiErrorType {
  QUOTA_EXCEEDED = "quota_exceeded",
  INVALID_REQUEST = "invalid_request",
  AUTH_ERROR = "auth_error",
  NOT_FOUND = "not_found",
  SERVER_ERROR = "server_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN = "unknown",
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  maxDelayMs: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 10000,
};

// Cache for storing API key data
class YouTubeApiKeyManager {
  private apiKeys: ApiKeyData[] = [];
  private currentKeyIndex: number = 0;

  constructor() {
    // Initialize the keys from environment variables with their names
    const keyConfigs = [
      { key: process.env.YOUTUBE_API_KEY, name: "YOUTUBE_API_KEY" },
      { key: process.env.YOUTUBE_API_KEY_2, name: "YOUTUBE_API_KEY_2" },
      { key: process.env.YOUTUBE_API_KEY_3, name: "YOUTUBE_API_KEY_3" },
      { key: process.env.YOUTUBE_API_KEY_4, name: "YOUTUBE_API_KEY_4" },
      { key: process.env.YOUTUBE_API_KEY_5, name: "YOUTUBE_API_KEY_5" },
      { key: process.env.YOUTUBE_API_KEY_6, name: "YOUTUBE_API_KEY_6" },
      { key: process.env.YOUTUBE_API_KEY_7, name: "YOUTUBE_API_KEY_7" },
      { key: process.env.YOUTUBE_API_KEY_8, name: "YOUTUBE_API_KEY_8" },
      { key: process.env.YOUTUBE_API_KEY_9, name: "YOUTUBE_API_KEY_9" },
      { key: process.env.YOUTUBE_API_KEY_10, name: "YOUTUBE_API_KEY_10" },
    ].filter((config) => Boolean(config.key)) as {
      key: string;
      name: string;
    }[];

    if (keyConfigs.length === 0) {
      console.error("No YouTube API keys found in environment variables");
    }

    // Initialize API key data with environment variable names
    this.apiKeys = keyConfigs.map((config) => ({
      key: config.key,
      envName: config.name,
      status: ApiKeyStatus.ACTIVE,
      lastUsed: new Date(0), // Initialize with epoch time
      errorCount: 0,
    }));
  }

  /**
   * Get the current active API key
   * @returns The current API key or null if no keys are available
   */
  getCurrentKey(): string | null {
    // If we have no keys, return null
    if (this.apiKeys.length === 0) {
      return null;
    }

    // Return the current key if it's active
    if (this.apiKeys[this.currentKeyIndex].status === ApiKeyStatus.ACTIVE) {
      this.apiKeys[this.currentKeyIndex].lastUsed = new Date();
      console.debug(
        `[YouTubeAPI] Using API key from ${
          this.apiKeys[this.currentKeyIndex].envName
        }`
      );
      return this.apiKeys[this.currentKeyIndex].key;
    }

    // Try to find an active key
    const activeKeyIndex = this.apiKeys.findIndex(
      (key) => key.status === ApiKeyStatus.ACTIVE
    );
    if (activeKeyIndex >= 0) {
      this.currentKeyIndex = activeKeyIndex;
      this.apiKeys[this.currentKeyIndex].lastUsed = new Date();
      console.debug(
        `[YouTubeAPI] Switched to API key from ${
          this.apiKeys[this.currentKeyIndex].envName
        }`
      );
      return this.apiKeys[this.currentKeyIndex].key;
    }

    // No active keys found
    console.debug("[YouTubeAPI] No active API keys available");
    return null;
  }

  /**
   * Get the next available API key
   * @returns The next API key or null if no keys are available
   */
  rotateToNextKey(): string | null {
    // If we have no keys, return null
    if (this.apiKeys.length === 0) {
      return null;
    }

    // Try to find the next active key
    let checkedKeys = 0;
    while (checkedKeys < this.apiKeys.length) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      if (this.apiKeys[this.currentKeyIndex].status === ApiKeyStatus.ACTIVE) {
        this.apiKeys[this.currentKeyIndex].lastUsed = new Date();
        console.debug(
          `[YouTubeAPI] Rotated to API key from ${
            this.apiKeys[this.currentKeyIndex].envName
          }`
        );
        return this.apiKeys[this.currentKeyIndex].key;
      }
      checkedKeys++;
    }

    // No active keys found
    console.debug("[YouTubeAPI] No active API keys found during rotation");
    return null;
  }

  /**
   * Mark the current key as having a quota exceeded error
   * @param errorMessage The error message
   */
  markCurrentKeyQuotaExceeded(errorMessage?: string): void {
    if (this.apiKeys.length === 0) return;

    this.apiKeys[this.currentKeyIndex].status = ApiKeyStatus.QUOTA_EXCEEDED;
    this.apiKeys[this.currentKeyIndex].lastError = errorMessage;
    console.warn(
      `[YouTubeAPI] Quota exceeded for API key from ${
        this.apiKeys[this.currentKeyIndex].envName
      }`
    );
  }

  /**
   * Mark the current key as having an error
   * @param errorMessage The error message
   */
  markCurrentKeyError(errorMessage?: string): void {
    if (this.apiKeys.length === 0) return;

    this.apiKeys[this.currentKeyIndex].errorCount++;
    this.apiKeys[this.currentKeyIndex].lastError = errorMessage;

    // Mark as error if we've seen multiple errors
    if (this.apiKeys[this.currentKeyIndex].errorCount >= 3) {
      this.apiKeys[this.currentKeyIndex].status = ApiKeyStatus.ERROR;
      console.error(
        `[YouTubeAPI] API key from ${
          this.apiKeys[this.currentKeyIndex].envName
        } marked as error after ${
          this.apiKeys[this.currentKeyIndex].errorCount
        } errors`
      );
    }
  }

  /**
   * Reset a key's status to active
   * @param keyIndex Index of the key to reset
   */
  resetKeyStatus(keyIndex: number): void {
    if (keyIndex >= 0 && keyIndex < this.apiKeys.length) {
      this.apiKeys[keyIndex].status = ApiKeyStatus.ACTIVE;
      this.apiKeys[keyIndex].errorCount = 0;
      this.apiKeys[keyIndex].lastError = undefined;
    }
  }

  /**
   * Reset all keys to active status
   */
  resetAllKeys(): void {
    this.apiKeys.forEach((keyData) => {
      keyData.status = ApiKeyStatus.ACTIVE;
      keyData.errorCount = 0;
      keyData.lastError = undefined;
    });
  }

  /**
   * Get the status of all API keys
   * @returns Array of key status information (without the actual keys)
   */
  getKeyStatuses(): {
    index: number;
    envName: string;
    status: ApiKeyStatus;
    lastUsed: Date;
    errorCount: number;
  }[] {
    return this.apiKeys.map((keyData, index) => ({
      index,
      envName: keyData.envName,
      status: keyData.status,
      lastUsed: keyData.lastUsed,
      errorCount: keyData.errorCount,
    }));
  }

  /**
   * Check if any active keys are available
   * @returns true if at least one key is active
   */
  hasActiveKeys(): boolean {
    return this.apiKeys.some((key) => key.status === ApiKeyStatus.ACTIVE);
  }
}

// Create a singleton instance
export const youtubeApiKeyManager = new YouTubeApiKeyManager();

/**
 * Get a YouTube API key, handling rotation if needed
 * @returns A YouTube API key or null if none are available
 */
export function getYoutubeApiKey(): string | null {
  // Try to get the current key
  let apiKey = youtubeApiKeyManager.getCurrentKey();

  // If no key is available, try to rotate to the next key
  if (!apiKey) {
    apiKey = youtubeApiKeyManager.rotateToNextKey();
  }

  return apiKey;
}

/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified duration
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determine the error type from a YouTube API error response
 * @param response Fetch response object
 * @param responseData Error data from the API
 * @returns The type of YouTube API error
 */
export function detectYouTubeApiErrorType(
  response: Response,
  responseData: any
): YouTubeApiErrorType {
  // Network-level errors
  if (!response.ok) {
    // Check for quota limit exceeded (HTTP 403 with quotaExceeded reason)
    if (response.status === 403) {
      const error = responseData?.error;

      // Look for quota exceeded error messages in various places
      if (
        error?.errors?.some(
          (e: any) =>
            e.reason === "quotaExceeded" ||
            e.reason === "dailyLimitExceeded" ||
            e.reason === "rateLimitExceeded"
        ) ||
        error?.message?.includes("quota") ||
        error?.message?.includes("limit exceeded")
      ) {
        return YouTubeApiErrorType.QUOTA_EXCEEDED;
      }

      // Look for authentication errors
      if (
        error?.errors?.some(
          (e: any) =>
            e.reason === "authError" ||
            e.reason === "invalid_grant" ||
            e.reason === "forbidden"
        ) ||
        error?.message?.includes("auth") ||
        error?.message?.includes("permission") ||
        error?.message?.includes("access")
      ) {
        return YouTubeApiErrorType.AUTH_ERROR;
      }

      // Default 403 response to auth error
      return YouTubeApiErrorType.AUTH_ERROR;
    }

    // Check for invalid request (HTTP 400)
    if (response.status === 400) {
      return YouTubeApiErrorType.INVALID_REQUEST;
    }

    // Check for not found (HTTP 404)
    if (response.status === 404) {
      return YouTubeApiErrorType.NOT_FOUND;
    }

    // Check for server errors (HTTP 5xx)
    if (response.status >= 500) {
      return YouTubeApiErrorType.SERVER_ERROR;
    }

    // Default to unknown for other HTTP error codes
    return YouTubeApiErrorType.UNKNOWN;
  }

  // Default to unknown if no specific error is detected
  return YouTubeApiErrorType.UNKNOWN;
}

/**
 * Handle a YouTube API error
 * @param response Fetch response object
 * @param responseData Error data from the API
 * @returns True if the error was handled and a retry might succeed, false otherwise
 */
export function handleYouTubeApiError(
  response: Response,
  responseData: any
): boolean {
  // Detect the error type
  const errorType = detectYouTubeApiErrorType(response, responseData);

  // Log the error
  console.error(
    `YouTube API error: ${response.status} ${response.statusText}`,
    {
      errorType,
      details: responseData,
    }
  );

  // Handle the error based on its type
  switch (errorType) {
    case YouTubeApiErrorType.QUOTA_EXCEEDED:
      // Mark the current key as having exceeded its quota
      youtubeApiKeyManager.markCurrentKeyQuotaExceeded(
        responseData?.error?.message || "Quota exceeded"
      );

      // Try to rotate to the next key
      const nextKey = youtubeApiKeyManager.rotateToNextKey();

      // If we have another key, we can retry
      return nextKey !== null;

    case YouTubeApiErrorType.AUTH_ERROR:
      // Mark the current key as having an auth error
      youtubeApiKeyManager.markCurrentKeyError(
        responseData?.error?.message || "Authentication error"
      );

      // Try to rotate to the next key
      const nextAuthKey = youtubeApiKeyManager.rotateToNextKey();

      // If we have another key, we can retry
      return nextAuthKey !== null;

    case YouTubeApiErrorType.INVALID_REQUEST:
      // This is a client error, no need to mark the key as bad
      // But also no need to retry with the same parameters
      return false;

    case YouTubeApiErrorType.NOT_FOUND:
      // Resource not found, no need to retry
      return false;

    case YouTubeApiErrorType.SERVER_ERROR:
      // Server-side error, can retry
      return true;

    case YouTubeApiErrorType.NETWORK_ERROR:
      // Network error, can retry
      return true;

    case YouTubeApiErrorType.UNKNOWN:
    default:
      // Unknown error, mark the key as having an error
      youtubeApiKeyManager.markCurrentKeyError(
        responseData?.error?.message || "Unknown error"
      );

      // We can try with another key
      const hasActiveKey = youtubeApiKeyManager.hasActiveKeys();
      return hasActiveKey;
  }
}

/**
 * Make a YouTube API request with automatic error handling and retry logic
 * @param url The URL to fetch (without the API key)
 * @param options Fetch options
 * @param retryConfig Configuration for retries
 * @returns The response data or null if all retries failed
 */
export async function fetchYouTubeApi<T>(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T | null> {
  let retries = 0;
  let delay = retryConfig.initialDelayMs;

  while (retries <= retryConfig.maxRetries) {
    try {
      // Get an API key
      const apiKey = getYoutubeApiKey();

      // If no API keys are available, fail
      if (!apiKey) {
        console.error("[YouTubeAPI] No YouTube API keys available");
        return null;
      }

      // Get the current key index to report which key is being used
      const keyStatuses = youtubeApiKeyManager.getKeyStatuses();
      const currentKey = keyStatuses.find(
        (k) => k.status === ApiKeyStatus.ACTIVE
      );

      // Add the API key to the URL
      const separator = url.includes("?") ? "&" : "?";
      const apiUrl = `${url}${separator}key=${apiKey}`;

      console.debug(
        `[YouTubeAPI] Making request with key from ${
          currentKey?.envName || "unknown"
        }`
      );

      // Make the request
      const response = await fetch(apiUrl, options);

      // Parse the response
      const data = await response.json();

      // Check if the response is ok
      if (!response.ok) {
        // Handle the error
        const canRetry = handleYouTubeApiError(response, data);

        // If we can't retry, fail
        if (!canRetry) {
          console.error("YouTube API error cannot be retried", {
            status: response.status,
            statusText: response.statusText,
            data,
          });
          return null;
        }

        // If we've used all our retries, fail
        if (retries >= retryConfig.maxRetries) {
          console.error("YouTube API error max retries exceeded", {
            status: response.status,
            statusText: response.statusText,
            data,
          });
          return null;
        }

        // Wait before retrying
        await sleep(delay);

        // Increase the delay for the next retry (exponential backoff)
        delay = Math.min(
          delay * retryConfig.backoffFactor,
          retryConfig.maxDelayMs
        );

        // Increment the retry counter
        retries++;

        // Skip to the next iteration
        continue;
      }

      // If we get here, the request was successful
      return data as T;
    } catch (error) {
      console.error("Error making YouTube API request", error);

      // If we've used all our retries, fail
      if (retries >= retryConfig.maxRetries) {
        console.error("YouTube API request max retries exceeded");
        return null;
      }

      // Wait before retrying
      await sleep(delay);

      // Increase the delay for the next retry (exponential backoff)
      delay = Math.min(
        delay * retryConfig.backoffFactor,
        retryConfig.maxDelayMs
      );

      // Increment the retry counter
      retries++;
    }
  }

  // If we get here, all retries failed
  return null;
}
