using Domain.Common;
using Domain.Entities.ApplicationUsers;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.SystemLogs;

public class SystemLog : BaseAuditableEntity
{
    [ForeignKey("User")]
    public string? UserId { get; set; }
    public User? User { get; set; }

    public string Message { get; set; }
    public string? Description { get; set; }
    public string? Instruction { get; set; }
    public bool IsSeen { get; set; } = false;
}
