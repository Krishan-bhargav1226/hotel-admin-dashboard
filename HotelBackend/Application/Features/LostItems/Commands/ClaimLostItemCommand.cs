using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Hotels;
using Domain.Entities.LostItems;
using MediatR;
using Shared;

namespace Application.Features.LostItems.Commands;

public class ClaimLostItemCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public string? ClaimedBy { get; set; }
    public string? ClaimantContact { get; set; }
    public LostItemStatus Status { get; set; } = LostItemStatus.CLAIMED;
}

internal class ClaimLostItemCommandHandler : IRequestHandler<ClaimLostItemCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public ClaimLostItemCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(ClaimLostItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _unitOfWork.Repository<LostItem>().GetByID(request.Id);
        if (item == null)
            return Result<string>.BadRequest("Lost item does not exist.");

        if ((int)request.Status == 0)
            request.Status = LostItemStatus.CLAIMED;

        item.Status = request.Status;
        item.ClaimedBy = request.ClaimedBy;
        item.ClaimantContact = request.ClaimantContact;
        item.ClaimedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<LostItem>().UpdateAsync(item);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Lost item updated successfully.");
    }
}
