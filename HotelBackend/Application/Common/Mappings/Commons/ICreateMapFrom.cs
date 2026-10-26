using AutoMapper;

namespace Application.Common.Mappings.Commons;

public interface ICreateMapFrom<T>
{
    void CreateMapping(Profile profile) =>
        profile.CreateMap(GetType(), typeof(T))
               .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
}
