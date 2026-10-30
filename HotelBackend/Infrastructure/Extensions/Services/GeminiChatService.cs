using Application.Dto.Chat;
using Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;
using System.Text.RegularExpressions;

namespace Infrastructure.Extensions.Services;

public class GeminiChatService : IGeminiChatService
{
    private readonly IConfiguration _configuration;
    private readonly IHotelGroundingService _groundingService;
    private readonly HttpClient _httpClient;

    public GeminiChatService(
        IConfiguration configuration,
        IHotelGroundingService groundingService,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _groundingService = groundingService;
        _httpClient = httpClient;
    }

    public async Task<ChatResponseDto> ProcessChatMessageAsync(
        ChatRequestDto request,
        string userRole,
        string userId,
        int? organizationId,
        CancellationToken cancellationToken = default)
    {
        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                     ?? _configuration["GeminiSettings:ApiKey"] 
                     ?? "";

        var configuredModel = _configuration["GeminiSettings:Model"] ?? "gemini-3.5-flash-lite";
        var baseUrl = _configuration["GeminiSettings:BaseUrl"] ?? "https://generativelanguage.googleapis.com/v1beta";

        // 1. SECURE DATABASE GROUNDING
        var groundingContext = await _groundingService.GetSecureGroundingContextAsync(
            userRole, organizationId, request.Message, request.PropertyId, request.PropertyName, request.PageContext, cancellationToken);

        // Immediate refusal if backend RBAC was violated
        if (groundingContext.StartsWith("[AUTHORIZATION VIOLATION]"))
        {
            return new ChatResponseDto
            {
                Reply = groundingContext,
                Role = "model",
                Timestamp = DateTime.UtcNow,
                SuggestedActions = GetSuggestedPillsForRole(userRole, request.PageContext)
            };
        }

        // 2. BUILD CUTE, CONTEXT-AWARE SYSTEM INSTRUCTION
        var systemInstruction = BuildCuteRoleSystemInstruction(userRole, request.PropertyName, request.PageContext);

        // 3. PREPARE GEMINI API PAYLOAD
        var contents = new List<object>();

        // Include conversation history (last 6 turns max for context)
        if (request.History != null && request.History.Count > 0)
        {
            foreach (var h in request.History.TakeLast(6))
            {
                var role = h.Role.Equals("model", StringComparison.OrdinalIgnoreCase) ? "model" : "user";
                contents.Add(new
                {
                    role = role,
                    parts = new[] { new { text = h.Content } }
                });
            }
        }

        // Append current turn with grounding context
        contents.Add(new
        {
            role = "user",
            parts = new[]
            {
                new { text = $"[DATABASE REAL-TIME LIVE DATA]:\n{groundingContext}\n\n[USER QUESTION / MESSAGE]:\n{request.Message}" }
            }
        });

        var payload = new
        {
            system_instruction = new
            {
                parts = new[] { new { text = systemInstruction } }
            },
            contents = contents,
            generationConfig = new
            {
                temperature = 0.4,
                maxOutputTokens = 1000
            }
        };

        var candidateModels = new[] { configuredModel, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest" }
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        string? replyText = null;

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            foreach (var model in candidateModels)
            {
                try
                {
                    var endpoint = $"{baseUrl}/models/{model}:generateContent?key={apiKey}";
                    var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

                    using var modelCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                    modelCts.CancelAfter(TimeSpan.FromSeconds(6));

                    var response = await _httpClient.PostAsync(endpoint, content, modelCts.Token);
                    var responseBody = await response.Content.ReadAsStringAsync(modelCts.Token);

                    if (response.IsSuccessStatusCode)
                    {
                        dynamic? result = JsonConvert.DeserializeObject(responseBody);
                        var candidates = result?.candidates;
                        if (candidates != null && candidates.Count > 0)
                        {
                            var parts = candidates[0]?.content?.parts;
                            if (parts != null)
                            {
                                var textBuilder = new StringBuilder();
                                foreach (var part in parts)
                                {
                                    string? pText = part?.text;
                                    if (!string.IsNullOrWhiteSpace(pText))
                                    {
                                        textBuilder.Append(pText);
                                    }
                                }
                                var extracted = textBuilder.ToString().Trim();
                                if (!string.IsNullOrEmpty(extracted))
                                {
                                    replyText = extracted;
                                    break;
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Continue to next model or fallback
                }
            }
        }

        // Fallback to cute intelligent response if API was unreachable
        if (string.IsNullOrWhiteSpace(replyText))
        {
            replyText = GenerateCuteIntelligentFallback(userRole, request.Message, groundingContext, request.PropertyName);
        }

        return new ChatResponseDto
        {
            Reply = replyText,
            Role = "model",
            Timestamp = DateTime.UtcNow,
            SuggestedActions = GetSuggestedPillsForRole(userRole, request.PageContext)
        };
    }

    private string BuildCuteRoleSystemInstruction(string role, string? propertyName, string? pageContext)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You are 'Dot' 🛎️✨, the intelligent, friendly, and ultra-sharp AI Hotel Concierge for this hotel management system.");
        sb.AppendLine($"The active authenticated user has the verified role: '{role}'.");
        if (!string.IsNullOrWhiteSpace(propertyName))
            sb.AppendLine($"Active Hotel Property: '{propertyName}'.");
        if (!string.IsNullOrWhiteSpace(pageContext))
            sb.AppendLine($"User is currently browsing screen: '{pageContext}'.");

        sb.AppendLine();
        sb.AppendLine("CRITICAL INSTRUCTIONS:");
        sb.AppendLine("1. DIRECT ANSWER FIRST: Directly and concisely answer what the user asked! Do NOT dump irrelevant data or boilerplate unless specifically requested.");
        sb.AppendLine("2. DATABASE FIDELITY: Only speak from the provided [DATABASE REAL-TIME LIVE DATA]. State exact room numbers, statuses, prices, and guest names directly from the data. Never invent fake rooms or guess.");
        sb.AppendLine("3. LANGUAGE MATCHING: If the user speaks in Hindi or Hinglish (e.g. 'room 111 ka kya status hai', 'kitne rooms khali hain', 'safai hui kya?'), reply warmly and naturally in fluent Hinglish or Hindi! If they speak English, reply in English.");
        sb.AppendLine("4. SLEEK & POLITE CONCIERGE: Be polite, sharp, charming, and professional. Use clean emoji accents like 🛎️, 🛏️, ✨, 🏨, 🧹, 👥 to make responses delightful.");
        sb.AppendLine("5. FORMATTING: Use clean markdown bolding and bullet points so information is instantly scannable.");

        return sb.ToString();
    }

    private string GenerateCuteIntelligentFallback(string role, string userQuery, string groundingContext, string? propertyName)
    {
        var lower = (userQuery ?? "").ToLower();
        var sb = new StringBuilder();

        // 1. Specific Room Inquiry (e.g. Room 111, 101, 123)
        var roomMatch = Regex.Match(lower, @"\b(\d{2,4})\b");
        if (roomMatch.Success)
        {
            var roomNum = roomMatch.Groups[1].Value;
            var lineMatch = Regex.Match(groundingContext, $@"\* Room {roomNum} \([^\)]+\)");
            if (lineMatch.Success)
            {
                var roomDetails = lineMatch.Value;
                bool isCleaning = roomDetails.Contains("Status: CLEANING", StringComparison.OrdinalIgnoreCase);
                bool isAvailable = roomDetails.Contains("Status: AVAILABLE", StringComparison.OrdinalIgnoreCase);
                bool isOccupied = roomDetails.Contains("Status: OCCUPIED", StringComparison.OrdinalIgnoreCase);
                bool isMaintenance = roomDetails.Contains("Status: MAINTENANCE", StringComparison.OrdinalIgnoreCase);

                string statusHindi = isCleaning ? "Cleaning / Safai chal rahi hai 🧹" :
                                     isAvailable ? "Available aur ready hai! ✨" :
                                     isOccupied ? "Occupied (Booked) hai 👥" :
                                     isMaintenance ? "Under Maintenance hai 🛠️" : "Registered hai";

                sb.AppendLine($"Hello ji! ✨ **Room {roomNum}** ka live status abhi **{statusHindi}**! 🛎️");
                sb.AppendLine();
                sb.AppendLine($"- **Details:** {roomDetails.Replace("* ", "")}");

                if (isCleaning)
                    sb.AppendLine("\n> 💡 *Tip: Housekeeping complete hone par status 'Available' set kar sakte hain!* 🛎️");
                return sb.ToString();
            }
        }

        // 2. Greetings
        if (lower.Contains("hi") || lower.Contains("hello") || lower.Contains("hey") || lower.Contains("namaste") || lower.Contains("kaise ho") || lower.Contains("bhai"))
        {
            sb.AppendLine($"Hello ji! ✨ Main hoon **Dot** 🛎️, aapka smart Hotel AI Concierge assistant!");
            sb.AppendLine($"Aap abhi **{propertyName ?? "Hotel"}** desk manage kar rahe hain as **{role}**.");
            sb.AppendLine();
            sb.AppendLine("Aap mujhse live hotel data ke baare me pooch sakte hain:");
            sb.AppendLine("- Kisi bhi room ka live status (jaise *'Room 111 status'* 🛏️)");
            sb.AppendLine("- Khali ya dirty rooms ki list 🧹");
            sb.AppendLine("- Check-in timings aur in-house guests 👥");
            sb.AppendLine();
            sb.AppendLine("Bataiye, kis cheez me help karu aapki? 🛎️✨");
            return sb.ToString();
        }

        // 3. Clean / Dirty / Housekeeping inquiry
        if (lower.Contains("dirty") || lower.Contains("clean") || lower.Contains("safai") || lower.Contains("housekeep"))
        {
            sb.AppendLine("Aapke hotel ka live **Housekeeping & Cleaning Status** ye raha! 🧹✨");
            sb.AppendLine();
            var cleaningLines = groundingContext.Split('\n')
                .Where(l => l.Contains("Status: CLEANING") || l.Contains("Cleaning="))
                .Take(5);
            foreach (var l in cleaningLines)
            {
                sb.AppendLine(l.Trim());
            }
            sb.AppendLine();
            sb.AppendLine("> *Real-time database sync active.* 🛎️");
            return sb.ToString();
        }

        // 4. Available rooms inquiry
        if (lower.Contains("available") || lower.Contains("khali") || lower.Contains("free") || lower.Contains("empty"))
        {
            sb.AppendLine("Yeh rahe abhi ke **Available & Ready Rooms**! 🛏️✨");
            sb.AppendLine();
            var availLines = groundingContext.Split('\n')
                .Where(l => l.Contains("Status: AVAILABLE") || l.Contains("Available="))
                .Take(5);
            foreach (var l in availLines)
            {
                sb.AppendLine(l.Trim());
            }
            sb.AppendLine();
            sb.AppendLine("> *Directly booked from Front Desk Check-in.* 🛎️");
            return sb.ToString();
        }

        // 5. Timings inquiry
        if (lower.Contains("timing") || lower.Contains("time") || lower.Contains("check-in") || lower.Contains("checkout"))
        {
            sb.AppendLine("Hotel policy ke mutabiq check-in timings ye hain: ⏰🏨");
            sb.AppendLine("- **Standard Check-in:** 12:00 PM");
            sb.AppendLine("- **Standard Check-out:** 11:00 AM");
            sb.AppendLine("- Early check-in ya late check-out front desk se request kiya ja sakta hai! 🛎️✨");
            return sb.ToString();
        }

        // 6. Default helpful summary
        sb.AppendLine($"Here is the live operational summary for **{propertyName ?? "your property"}** (**{role}**): 🛎️✨");
        sb.AppendLine();
        var keyLines = groundingContext.Split('\n')
            .Where(l => l.StartsWith("- ") && !l.Contains("Verified"))
            .Take(4);
        foreach (var l in keyLines)
        {
            sb.AppendLine(l.Trim());
        }
        sb.AppendLine();
        sb.AppendLine("Aap mujhse kisi specific room ya guest ke baare me seedha pooch sakte hain! 🛎️✨");
        return sb.ToString();
    }

    private List<string> GetSuggestedPillsForRole(string role, string? pageContext)
    {
        var lowerPage = (pageContext ?? "").ToLower();

        if (lowerPage.Contains("room"))
        {
            return new List<string>
            {
                "Room 111 ka status kya hai? 🛏️",
                "Available rooms list 🏨",
                "Cleaning pending rooms 🧹",
                "Room rates & types ✨"
            };
        }

        if (lowerPage.Contains("housekeep"))
        {
            return new List<string>
            {
                "Which rooms need urgent cleaning? 🧹",
                "Room 111 cleaning status 🛏️",
                "Inspected rooms ready for guests ✨",
                "Housekeeping queue summary 📋"
            };
        }

        if (lowerPage.Contains("check-in") || lowerPage.Contains("stay"))
        {
            return new List<string>
            {
                "Available rooms for check-in 🛏️",
                "List of in-house guests 👥",
                "Check-in & checkout policy ⏰",
                "Room 111 price & bed type ✨"
            };
        }

        var lowerRole = (role ?? "").ToLower();

        if (lowerRole.Contains("admin") || lowerRole.Contains("manager"))
        {
            return new List<string>
            {
                "Hotel occupancy & room summary 🏨",
                "Room 111 live status 🛏️",
                "Active in-house guests 👥",
                "Revenue & audit summary 💰"
            };
        }

        return new List<string>
        {
            "Room 111 status 🛏️",
            "Available rooms right now ✨",
            "In-house checked-in guests 👥",
            "Standard check-in timings ⏰"
        };
    }
}
