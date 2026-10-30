using Application.Dto.CommonDtos;
using Application.Dto.Users.GetUserDtos;
using AutoMapper;
using Domain.Entities.ApplicationUsers;

namespace Application.Common.Mappings.Commons;

public class UserMapping : Profile
{
    public UserMapping()
    {
        CreateMap<User, GetUserDto>()
            .ForMember(x => x.Roles, opt => opt.MapFrom(x => x.UserRoles.Select(ur => ur.Role)));

        CreateMap<User, IdAndNameDto<string>>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => x.Id))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => $"{x.FirstName} {x.LastName}".Trim()));

        CreateMap<User, StringIdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(u => u.Id))
            .ForMember(x => x.Name, opt => opt.MapFrom(u => $"{u.FirstName} {u.LastName}".Trim()));
    }
}
