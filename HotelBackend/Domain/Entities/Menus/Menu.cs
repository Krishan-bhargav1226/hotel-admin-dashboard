using Domain.Entities.MenuTypes;
using Domain.Entities.Organizations;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Menus;

public class Menu
{
    [Key]
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? URL { get; set; }
    public string? Icon { get; set; }
    public string? ImageURL { get; set; }
    public string? SubTitle { get; set; }
    public string? QueryString1 { get; set; }
    public string? QueryString2 { get; set; }

    [ForeignKey("Parent")]
    public Guid? ParentId { get; set; }
    public Menu? Parent { get; set; }

    [ForeignKey("MenuType")]
    public int? MenuTypeId { get; set; }
    public MenuType? MenuType { get; set; }

    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public string ClaimValue { get; set; }
    public bool IsDeleted { get; set; } = false;

    [ForeignKey("Organization")]
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }

}
