using FluentValidation;
using HotelAdmin.Application.Abstractions;
using HotelAdmin.Domain.Entities;
using MediatR;

namespace HotelAdmin.Application.Storage.Commands;

public sealed record UpsertStorageRecordCommand(string Key, string JsonValue) : IRequest;

public sealed class UpsertStorageRecordCommandValidator : AbstractValidator<UpsertStorageRecordCommand>
{
    public UpsertStorageRecordCommandValidator()
    {
        RuleFor(command => command.Key).Must(HotelRecord.IsValidKey)
            .WithMessage("Storage keys must be 1–160 characters and cannot contain path separators or control characters.");
        RuleFor(command => command.JsonValue).Must(HotelRecord.IsValidJson)
            .WithMessage("Storage values must be valid JSON.");
    }
}

public sealed class UpsertStorageRecordHandler(IHotelRecordRepository repository, IClock clock)
    : IRequestHandler<UpsertStorageRecordCommand>
{
    public async Task Handle(UpsertStorageRecordCommand request, CancellationToken cancellationToken)
    {
        var existing = await repository.GetByKeyAsync(request.Key, cancellationToken);
        if (existing is null)
        {
            existing = HotelRecord.Create(request.Key, request.JsonValue, clock.UtcNow);
        }
        else
        {
            existing.ReplaceValue(request.JsonValue, clock.UtcNow);
        }

        await repository.UpsertAsync(existing, cancellationToken);
    }
}
