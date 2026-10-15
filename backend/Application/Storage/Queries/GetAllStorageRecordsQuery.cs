using HotelAdmin.Application.Abstractions;
using MediatR;

namespace HotelAdmin.Application.Storage.Queries;

public sealed record GetAllStorageRecordsQuery : IRequest<IReadOnlyList<StorageRecordDto>>;

public sealed class GetAllStorageRecordsHandler(IHotelRecordRepository repository)
    : IRequestHandler<GetAllStorageRecordsQuery, IReadOnlyList<StorageRecordDto>>
{
    public async Task<IReadOnlyList<StorageRecordDto>> Handle(
        GetAllStorageRecordsQuery request,
        CancellationToken cancellationToken)
    {
        var records = await repository.GetAllAsync(cancellationToken);
        return records.Select(record => new StorageRecordDto(record.Key, record.JsonValue, record.UpdatedAt)).ToArray();
    }
}
