namespace Application.Dto.GetUserIdAndOrganizationIds;

public class GetUserIdAndOrganizationIdDto
{
    public bool IsAdmin { get; set; } = false;
    public bool IsSchool { get; set; } = false;
    public string UserId { get; set; }
    public int? OrganizationId { get; set; }
    public int? UserOrganizationId { get; set; }
}
