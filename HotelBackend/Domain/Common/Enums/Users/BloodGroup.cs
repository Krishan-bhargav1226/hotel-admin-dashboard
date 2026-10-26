using System.ComponentModel.DataAnnotations;

namespace Domain.Commons.Enums.Employees;

public enum BloodGroup
{
    [Display(Name = "O+")]
    O_Positive = 1,

    [Display(Name = "O-")]
    O_Negative,

    [Display(Name = "A+")]
    A_Positive,

    [Display(Name = "A-")]
    A_Negative,

    [Display(Name = "B+")]
    B_Positive,

    [Display(Name = "B-")]
    B_Negative,

    [Display(Name = "AB+")]
    AB_Positive,

    [Display(Name = "AB-")]
    AB_Negative
}
