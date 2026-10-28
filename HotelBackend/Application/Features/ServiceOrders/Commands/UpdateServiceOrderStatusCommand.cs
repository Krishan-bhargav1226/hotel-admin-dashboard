using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.ServiceOrders;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.ServiceOrders.Commands;

public record UpdateServiceOrderStatusCommand(int Id, ServiceOrderStatus Status) : IRequest<Result<int>>;

internal class UpdateServiceOrderStatusCommandHandler : IRequestHandler<UpdateServiceOrderStatusCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceOrderStatusCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(UpdateServiceOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.Repository<ServiceOrder>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (order == null)
            return Result<int>.NotFound("Service order not found.");

        order.Status = request.Status;
        await _unitOfWork.Repository<ServiceOrder>().UpdateAsync(order);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(order.Id, "Service order status updated.");
    }
}
