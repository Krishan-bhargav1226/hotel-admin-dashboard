using Application.Dto.RatePlans;
using Application.Dto.Rooms;
using Application.Dto.ServiceOrders;
using Application.Dto.Stays;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.RatePlans;
using Domain.Entities.Rooms;
using Domain.Entities.ServiceOrders;
using Domain.Entities.Stays;

namespace Application.Common.Mappings;

public class HotelMapping : Profile
{
    public HotelMapping()
    {
        CreateMap<Room, GetRoomDto>()
            .ForMember(d => d.RoomTypeName, o => o.MapFrom(s => s.RoomType != null ? s.RoomType.Name : null))
            .ForMember(d => d.PropertyName, o => o.MapFrom(s => s.Property != null ? s.Property.Name : null));
        CreateMap<RatePlan, GetRatePlanDto>()
            .ForMember(d => d.RoomTypeIds, o => o.MapFrom(s => s.Rooms.Select(r => r.RoomTypeId).ToList()));

        CreateMap<ServiceOrderLine, GetServiceOrderItemDto>()
            .ForMember(d => d.MenuItemId, o => o.MapFrom(s => s.PosItemId));
        CreateMap<ServiceOrder, GetServiceOrderDto>()
            .ForMember(d => d.Items, o => o.MapFrom(s => s.Lines.Where(l => !l.IsDeleted)));

        CreateMap<Domain.Entities.Maintenances.MaintenanceTicket, Application.Dto.Maintenances.GetMaintenanceTicketDto>();
        CreateMap<StayCompanion, GetStayCompanionDto>();
        CreateMap<StayCharge, GetStayChargeDto>();
        CreateMap<Stay, GetStayDto>()
            .ForMember(d => d.RoomIds, o => o.MapFrom(s => s.StayRooms.Select(r => r.RoomId).ToList()))
            .ForMember(d => d.Companions, o => o.MapFrom(s => s.Companions))
            .ForMember(d => d.ExtraCharges, o => o.MapFrom(s => s.Charges))
            .ForMember(d => d.Bill, o => o.MapFrom(s => s.Status == StayStatus.COMPLETED
                ? new GetStayBillDto
                {
                    ElapsedMinutes = s.ElapsedMinutes,
                    BillableHours = s.BillableHours,
                    BaseLabel = s.BaseLabel,
                    BaseAmount = s.BaseAmount,
                    OvertimeHours = s.OvertimeHours,
                    OvertimeAmount = s.OvertimeAmount,
                    ExtraTotal = s.ExtraTotal,
                    GrossAmount = s.GrossAmount,
                    Discount = s.Discount,
                    TaxableAmount = s.TaxableAmount,
                    TaxPercent = s.TaxPercent,
                    TaxAmount = s.TaxAmount,
                    Total = s.TotalAmount
                }
                : null));
    }
}
