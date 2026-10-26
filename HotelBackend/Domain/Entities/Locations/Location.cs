using Domain.Entities.Locations.LocationTypes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Locations;

public class Location
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public LocationType LocationType { get; set; }
    public string? Code { get; set; }
    public string? ShortName { get; set; }

    [ForeignKey("Parent")]
    public int? ParentId { get; set; }
    public Location? Parent { get; set; }
}
