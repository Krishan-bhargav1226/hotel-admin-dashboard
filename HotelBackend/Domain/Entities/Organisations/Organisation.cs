using Domain.Entities.ApplicationUsers;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Organizations;

public class Organization
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
    public string? Logo { get; set; }
    public string? TagLine { get; set; }
    public string? WebSite { get; set; }

    [MaxLength(10, ErrorMessage = "Enter proper number")]
    [MinLength(10, ErrorMessage = "Enter proper number")]
    public long? PhoneNumber { get; set; }

    [EmailAddress(ErrorMessage = "Enter proper Email")]
    public string? Email { get; set; }
    public string? Facebook { get; set; }
    public string? LinkedIn { get; set; }
    public string? Instagram { get; set; }
    public string? Description { get; set; }

    [ForeignKey("Parent")]
    public int? ParentId { get; set; }
    public Organization? Parent { get; set; }
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedDate { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public bool? IsDeleted { get; set; } = false;
    public decimal Discount { get; set; }

    [NotMapped]
    public User? User { get; set; }

}
