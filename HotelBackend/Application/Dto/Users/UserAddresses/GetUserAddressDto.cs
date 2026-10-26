using Application.Common.Mappings.Commons;
using Application.Dto.Locations;
using Domain.Entities.UserAddresses;

namespace Application.Dto.Users;

public class GetUserAddressDto : IMapFrom<UserAddress>
{
    public string Address1 { get; set; }
    public string? Address2 { get; set; }
    public int? CityId { get; set; }
    public GetLocationDto? City { get; set; }
    public int? StateId { get; set; }
    public GetLocationDto? State { get; set; }
    public int? CountryId { get; set; }
    public GetLocationDto? Country { get; set; }
    public int? PinCode { get; set; }
}
