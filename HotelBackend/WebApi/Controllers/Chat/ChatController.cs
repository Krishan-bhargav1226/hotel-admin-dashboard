using Application.Dto.Chat;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebApi.Controllers.Chat;

[Route("api/chat")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly IGeminiChatService _geminiChatService;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public ChatController(
        IGeminiChatService geminiChatService,
        IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _geminiChatService = geminiChatService;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequestDto request, CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { succeeded = false, messages = new[] { "Message cannot be empty." } });
        }

        // 1. EXTRACT AUTHENTICATED CLAIMS
        var role = User.FindFirst(ClaimTypes.Role)?.Value 
                   ?? User.FindFirst("Role")?.Value 
                   ?? "Staff";

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("id")?.Value 
                     ?? "anonymous";

        // 2. RETRIEVE TENANT / ORGANIZATION CONTEXT
        int? organizationId = null;
        try
        {
            var userOrg = await _userIdAndOrganizationIdRepository.Get();
            organizationId = userOrg?.OrganizationId;
        }
        catch
        {
            // Default organization fallback if unauthenticated demo
            organizationId = 1;
        }

        // 3. SECURE AI INFERENCE & DATABASE GROUNDING
        var response = await _geminiChatService.ProcessChatMessageAsync(
            request, role, userId, organizationId, cancellationToken);

        return Ok(new
        {
            succeeded = true,
            data = response,
            messages = Array.Empty<string>(),
            code = 200
        });
    }
}
