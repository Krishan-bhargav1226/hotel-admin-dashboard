using Application.Dto.CommonDtos;
using Domain.Common.Enums.Hotels;

namespace Application.Dto.ServiceOrders;

public class GetServiceOrderItemDto
{
    public int MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class GetServiceOrderDto : BaseDto
{
    public string OrderNo { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int? StayId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool BilledToRoom { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public ServiceOrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public List<GetServiceOrderItemDto> Items { get; set; } = [];
}
