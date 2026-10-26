using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Application.Dto.Users.GetUserDtos;
using Domain.Entities.Employees;

namespace Application.Dto.Employees;

public class GetEmployeeDto : BaseDto, IMapFrom<Employee>
{
    public string UserId { get; set; } = string.Empty;
    public GetUserDto User { get; set; } = new();
}
