using AutoMapper;

namespace Application.Common.Mappings.Commons;

public interface IMapFrom<T>
{
    void Mapping(Profile profile) => profile.CreateMap(typeof(T), GetType());
}
