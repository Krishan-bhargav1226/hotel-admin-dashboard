using HotelAdmin.Application.Abstractions;
using HotelAdmin.Domain.Entities;
using FluentValidation;
using MediatR;

namespace HotelAdmin.Application.Storage.Queries;

public sealed record GetStorageRecordQuery(string Key) : IRequest<StorageRecordDto?>;

public sealed class GetStorageRecordQueryValidator : AbstractValidator<GetStorageRecordQuery>
{
    public GetStorageRecordQueryValidator() =>
        RuleFor(query => query.Key).Must(HotelRecord.IsValidKey).WithMessage("The storage key is invalid.");
}

public sealed class GetStorageRecordHandler(IHotelRecordRepository repository)
    : IRequestHandler<GetStorageRecordQuery, StorageRecordDto?>
{
    public async Task<StorageRecordDto?> Handle(GetStorageRecordQuery request, CancellationToken cancellationToken)
    {
        var record = await repository.GetByKeyAsync(request.Key, cancellationToken);
        return record is null ? null : new StorageRecordDto(record.Key, record.JsonValue, record.UpdatedAt);
    }
}
