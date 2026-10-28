namespace Application.Dto.Chat;

public class ChatMessageDto
{
    public string Role { get; set; } = "user"; // "user" or "model"
    public string Content { get; set; } = string.Empty;
}

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public List<ChatMessageDto> History { get; set; } = [];
    public string? PageContext { get; set; }
}

public class ChatResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public List<string> SuggestedActions { get; set; } = [];
}
