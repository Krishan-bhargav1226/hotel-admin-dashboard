using Domain.Common;
using Domain.Entities.ApplicationUsers;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Employees;

public class Employee:BaseAuditableEntity
{
    [ForeignKey("User")]
    public string UserId { get; set; }
    public User? User { get; set; }
}
