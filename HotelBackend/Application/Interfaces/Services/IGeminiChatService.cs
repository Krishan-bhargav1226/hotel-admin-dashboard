using Application.Dto.Chat;

namespace Application.Interfaces.Services;

public interface IGeminiChatService
{
    Task<ChatResponseDto> ProcessChatMessageAsync(
        ChatRequestDto request,
        string userRole,
        string userId,
        int? organizationId,
        CancellationToken cancellationToken = default);
}
