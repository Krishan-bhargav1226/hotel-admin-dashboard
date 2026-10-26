using Domain.Common;

namespace Domain.Entities.MenuTypes;

public class MenuType : BaseAuditableEntity
{
    public string Name { get; set; }
    public string? Icon { get; set; }
}
