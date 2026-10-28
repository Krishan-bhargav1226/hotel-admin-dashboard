export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  pageContext?: string;
}

export interface ChatResponse {
  reply: string;
  role: string;
  timestamp: string;
  suggestedActions: string[];
}

const API_BASE_URL = "http://localhost:7444";

export async function sendChatMessage(request: ChatRequest, token?: string): Promise<ChatResponse> {
  const authToken = token || localStorage.getItem("token") || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
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
