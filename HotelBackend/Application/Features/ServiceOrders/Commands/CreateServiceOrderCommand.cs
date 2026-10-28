using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Rooms;
using Domain.Entities.ServiceOrders;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.ServiceOrders.Commands;

public class CreateServiceOrderItemInput
{
    public int MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class CreateServiceOrderCommand : IRequest<Result<int>>
{
    public int RoomId { get; set; }
    public int? StayId { get; set; }
    public List<CreateServiceOrderItemInput> Items { get; set; } = [];
    public bool BilledToRoom { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public string? Notes { get; set; }
}

internal class CreateServiceOrderCommandHandler : IRequestHandler<CreateServiceOrderCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateServiceOrderCommandHandler(
        IUnitOfWork unitOfWork,
        IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if (request.Items == null || request.Items.Count == 0)
            return Result<int>.BadRequest("Order must have at least one item.");

        var room = await _unitOfWork.Repository<Room>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.RoomId, cancellationToken);
        if (room == null)
            return Result<int>.BadRequest("Room not found.");

        Stay? stay = null;
        if (request.StayId.HasValue)
        {
            stay = await _unitOfWork.Repository<Stay>().Entities
                .Include(s => s.Charges)
                .FirstOrDefaultAsync(x => x.Id == request.StayId.Value, cancellationToken);
        }
        else
        {
            stay = await _unitOfWork.Repository<Stay>().Entities
                .Include(s => s.Charges)
                .FirstOrDefaultAsync(x => x.RoomId == request.RoomId && x.Status == StayStatus.ACTIVE, cancellationToken);
        }

        var count = await _unitOfWork.Repository<ServiceOrder>().Entities.CountAsync(cancellationToken);
        var orderNo = $"ORD-{1000 + count + 1}";

        var subtotal = request.Items.Sum(i => i.Price * i.Quantity);
        var taxPercent = 5.0m;
        var taxAmount = Math.Round(subtotal * (taxPercent / 100m), 2);
        var totalAmount = subtotal + taxAmount;

        var order = new ServiceOrder
        {
            OrderNo = orderNo,
            RoomId = room.Id,
            RoomNumber = room.Number,
            StayId = stay?.Id,
            GuestName = stay?.GuestName ?? "Guest",
            Subtotal = subtotal,
            TaxPercent = taxPercent,
            TaxAmount = taxAmount,
            TotalAmount = totalAmount,
            BilledToRoom = request.BilledToRoom,
            PaymentMode = request.BilledToRoom ? null : (request.PaymentMode ?? PaymentMode.UPI),
            Status = ServiceOrderStatus.DELIVERED,
            Notes = request.Notes
        };

        foreach (var item in request.Items)
        {
            order.Lines.Add(new ServiceOrderLine
            {
                PosItemId = item.MenuItemId,
                Name = item.Name,
                Price = item.Price,
                Quantity = item.Quantity,
                Category = MenuCategory.MAIN_COURSE
            });
        }

        if (request.BilledToRoom && stay != null)
        {
            var charge = new StayCharge
            {
                StayId = stay.Id,
                Label = $"Room Service {orderNo}",
                Amount = totalAmount
            };
            await _unitOfWork.Repository<StayCharge>().AddAsync(charge);
            stay.TotalAmount += totalAmount;
            stay.DueAmount += totalAmount;
            await _unitOfWork.Repository<Stay>().UpdateAsync(stay);
        }

        await _unitOfWork.Repository<ServiceOrder>().AddAsync(order);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(order.Id, "Service order created successfully.");
    }
}
