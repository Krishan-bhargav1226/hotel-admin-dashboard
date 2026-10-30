using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Stays.Commands;

public class UpdateStayCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public List<CheckOutCharge>? ExtraCharges { get; set; }
    public decimal? Discount { get; set; }
    public string? Notes { get; set; }
}

public class CollectStayPaymentCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
}

internal class UpdateStayCommandHandler : IRequestHandler<UpdateStayCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStayCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UpdateStayCommand request, CancellationToken cancellationToken)
    {
        var stay = await _unitOfWork.Repository<Stay>().GetByID(request.Id);
        if (stay == null)
            return Result<string>.BadRequest("Stay does not exist.");
        if (stay.Status == StayStatus.COMPLETED)
            return Result<string>.BadRequest("This stay has already been checked out.");

        if (request.Discount != null)
            stay.Discount = request.Discount.Value;
        if (request.Notes != null)
            stay.Notes = request.Notes;

        if (request.ExtraCharges != null)
        {
            var existing = await _unitOfWork.Repository<StayCharge>().Entities
                .Where(x => x.StayId == stay.Id)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);
            foreach (var id in existing)
                await _unitOfWork.Repository<StayCharge>().DeleteAsync(id);

            foreach (var charge in request.ExtraCharges.Where(x => !string.IsNullOrWhiteSpace(x.Label)))
            {
                await _unitOfWork.Repository<StayCharge>().AddAsync(new StayCharge
                {
                    StayId = stay.Id,
                    Label = charge.Label.Trim(),
                    Amount = charge.Amount
                });
            }
        }

        await _unitOfWork.Repository<Stay>().UpdateAsync(stay);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Stay updated successfully.");
    }
}

internal class CollectStayPaymentCommandHandler : IRequestHandler<CollectStayPaymentCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CollectStayPaymentCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(CollectStayPaymentCommand request, CancellationToken cancellationToken)
    {
        var stay = await _unitOfWork.Repository<Stay>().GetByID(request.Id);
        if (stay == null)
            return Result<string>.BadRequest("Stay does not exist.");
        if (request.Amount <= 0)
            return Result<string>.BadRequest("Amount must be greater than zero.");

        stay.PaidAmount += request.Amount;
        stay.DueAmount = Math.Max(0, stay.TotalAmount - stay.PaidAmount);
        await _unitOfWork.Repository<Stay>().UpdateAsync(stay);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Payment collected successfully.");
    }
}

public class DeleteStayCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteStayCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteStayCommandHandler : IRequestHandler<DeleteStayCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteStayCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(DeleteStayCommand request, CancellationToken cancellationToken)
    {
        var stay = await _unitOfWork.Repository<Stay>().Entities
            .Include(x => x.StayRooms)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (stay == null)
            return Result<string>.BadRequest("Stay does not exist.");

        if (stay.Status == StayStatus.ACTIVE)
        {
            foreach (var roomId in stay.StayRooms.Select(x => x.RoomId).Append(stay.RoomId).Distinct())
            {
                var room = await _unitOfWork.Repository<Room>().GetByID(roomId);
                if (room == null || room.Status != RoomStatus.OCCUPIED)
                    continue;
                room.Status = RoomStatus.AVAILABLE;
                await _unitOfWork.Repository<Room>().UpdateAsync(room);
            }
        }

        await _unitOfWork.Repository<Stay>().DeleteAsync(stay.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Stay deleted successfully.");
    }
}
