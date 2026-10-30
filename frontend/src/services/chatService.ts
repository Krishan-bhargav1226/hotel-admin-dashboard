export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  pageContext?: string;
  propertyId?: number;
  propertyName?: string;
  pageTitle?: string;
}

export interface ChatResponse {
  reply: string;
  role: string;
  timestamp: string;
  suggestedActions: string[];
}

const API_BASE_URL = "http://localhost:7444";

export async function sendChatMessage(request: ChatRequest, token?: string): Promise<ChatResponse> {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken") || "";

  // Auto-detect property if not passed
  let resolvedPropertyId = request.propertyId;
  let resolvedPropertyName = request.propertyName;

  if (!resolvedPropertyId) {
    const rawId = localStorage.getItem("activePropertyId");
    if (rawId && Number(rawId) > 0) {
      resolvedPropertyId = Number(rawId);
    }
  }

  if (!resolvedPropertyName) {
    try {
      const rawUser = localStorage.getItem("hotel_auth_session");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        resolvedPropertyName = parsed?.propertyName || undefined;
        if (!resolvedPropertyId && parsed?.propertyId && Number(parsed.propertyId) > 0) {
          resolvedPropertyId = Number(parsed.propertyId);
        }
      }
    } catch {
      // ignore
    }
  }

  const payload: ChatRequest = {
    ...request,
    propertyId: resolvedPropertyId,
    propertyName: resolvedPropertyName,
    pageTitle: request.pageTitle || document.title,
    pageContext: request.pageContext || window.location.pathname,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Chat API returned HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result && result.data) {
    return result.data as ChatResponse;
  }

  return result as ChatResponse;
}
