using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.ServiceOrders;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.ServiceOrders.Commands;

public record DeleteServiceOrderCommand(int Id) : IRequest<Result<int>>;

internal class DeleteServiceOrderCommandHandler : IRequestHandler<DeleteServiceOrderCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceOrderCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(DeleteServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.Repository<ServiceOrder>().Entities
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (order == null)
            return Result<int>.NotFound("Service order not found.");

        foreach (var line in order.Lines.ToList())
        {
            await _unitOfWork.Repository<ServiceOrderLine>().DeleteAsync(line);
        }

        await _unitOfWork.Repository<ServiceOrder>().DeleteAsync(order);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(order.Id, "Service order deleted successfully.");
    }
}
