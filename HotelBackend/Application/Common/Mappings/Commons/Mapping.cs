using Application.Dto.CommonDtos;
using Application.Dto.Users.UserRoles;
using AutoMapper;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.Locations.LocationTypes;
using Domain.Entities.MenuTypes;
using System.Reflection;
using Application.Features.Locations.Commands;
using Domain.Entities.Locations;

namespace Application.Common.Mappings.Commons;

public class Mapping : Profile
{
    public Mapping()
    {
        ApplyMappingsFromAssembly(Assembly.GetExecutingAssembly());

        CreateMap<LocationType, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));

        CreateMap<MenuType, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => x.Id))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.Name));

        CreateMap<CreateLocationCommand, Location>();
        
        CreateMap<Role, GetRoleDto>()
            .ForMember(x => x.Menus, opt => opt.MapFrom(x => x.RoleMenus.Select(x => x.Menu)));
    }

    private void ApplyMappingsFromAssembly(Assembly assembly)
    {
        var profileType = typeof(Profile);
        var mapFromType = typeof(IMapFrom<>);
        var createMapFromType = typeof(ICreateMapFrom<>);

        bool HasInterface(Type t, Type interfaceType) =>
            t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == interfaceType);

        var types = assembly.GetExportedTypes().Where(t =>
            HasInterface(t, mapFromType) || HasInterface(t, createMapFromType)
        ).ToList();

        foreach (var type in types)
        {
            var instance = Activator.CreateInstance(type);

            var interfaces = type.GetInterfaces().Where(i => i.IsGenericType).ToList();
            foreach (var @interface in interfaces)
            {
                var genericType = @interface.GetGenericTypeDefinition();

                if (genericType == mapFromType || genericType == createMapFromType)
                {
                    var mappingMethod = @interface.GetMethod(
                        genericType == mapFromType ? nameof(IMapFrom<object>.Mapping) : nameof(ICreateMapFrom<object>.CreateMapping),
                        new[] { profileType }
                    );

                    mappingMethod?.Invoke(instance, new object[] { this });
                }
            }
        }
    }
}

