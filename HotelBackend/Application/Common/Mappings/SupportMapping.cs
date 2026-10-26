using Application.Dto.CommonDtos;
using AutoMapper;
using Domain.Common.Enums;
using Domain.Common.Enums.PriorityTypes;
using Domain.Common.Enums.RequestedSources;
using Domain.Common.Enums.Responses;

namespace Application.Common.Mappings;

public class SupportMapping : Profile
{
    public SupportMapping()
    {
        CreateMap<RequestedSourceType, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));

        CreateMap<PriorityType, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));

        CreateMap<SupportStatus, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));

        CreateMap<ResponseBy, IdAndNameDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => (int)x))
            .ForMember(x => x.Name, opt => opt.MapFrom(x => x.ToString()));
    }
}
