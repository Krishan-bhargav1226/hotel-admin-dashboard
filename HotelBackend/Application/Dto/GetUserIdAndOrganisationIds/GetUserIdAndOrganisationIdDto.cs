namespace Application.Dto.GetUserIdAndOrganizationIds;

public class GetUserIdAndOrganizationIdDto
{
    public bool IsAdmin { get; set; }
    public bool IsSuperAdmin { get; set; }
    public string? UserId { get; set; }
    public int? OrganizationId { get; set; }
    public int? UserOrganizationId { get; set; }
    public int? PropertyId { get; set; }
}
