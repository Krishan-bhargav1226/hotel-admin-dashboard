using Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Notifications;

public class AdminNotification : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Message { get; set; } = string.Empty;

    [StringLength(450)]
    public string? SubjectUserId { get; set; }

    public bool IsRead { get; set; }
}
