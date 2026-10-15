using HotelAdmin.Application.Abstractions;
using MediatR;

namespace HotelAdmin.Application.Storage.Commands;

public sealed record ClearStorageCommand : IRequest;

public sealed class ClearStorageHandler(IHotelRecordRepository repository)
    : IRequestHandler<ClearStorageCommand>
{
    public Task Handle(ClearStorageCommand request, CancellationToken cancellationToken) =>
        repository.ClearAsync(cancellationToken);
}
