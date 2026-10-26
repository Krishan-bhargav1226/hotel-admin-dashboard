using Application.Commons.Helpers;
using Application.Dto.CommonDtos;
using Application.Dto.Users.GetUserDtos;
using AutoMapper;
using Domain.Common.Enums.Employees;
using Domain.Commons.Enums.Employees;
using Domain.Commons.Enums.Users;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Locations.LocationTypes;
using Domain.Entities.MenuTypes;
using System.Reflection;

namespace Application.Common.Mappings.Commons;

public class UserMapping : Profile
{
    public UserMapping()
    {
        CreateMap<User, GetUserDto>()
            .ForMember(x => x.Roles, opt => opt.MapFrom(x => x.UserRoles.Select(ur => ur.Role)));

        CreateMap<User, IdAndNameDto<string>>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => x.Id))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.FirstName + " " + x.LastName));
        
        CreateMap<BloodGroup, IdAndNameDto>()
         .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
         .ForMember(x => x.Name, opt => opt.MapFrom(x => x));

        CreateMap<BloodGroup, string>().ConvertUsing(new EnumToDisplayNameConverter<BloodGroup>());

        CreateMap<Gender, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));

        CreateMap<MaritalStatus, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));

        CreateMap<User, StringIdAndNameDto>()
            .ForMember(x=>x.Id, User=> User.MapFrom(u=>u.Id))
            .ForMember(x => x.Name, User => User.MapFrom(u => u.FirstName??"" + " " + u.LastName??""));
    }
}

