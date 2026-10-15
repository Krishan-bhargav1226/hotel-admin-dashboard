using FluentValidation;
using HotelAdmin.Application.Abstractions;
using HotelAdmin.Domain.Entities;
using MediatR;

namespace HotelAdmin.Application.Storage.Commands;

public sealed record ReplaceStorageRecordsCommand(IReadOnlyDictionary<string, string> Records) : IRequest;

public sealed class ReplaceStorageRecordsCommandValidator : AbstractValidator<ReplaceStorageRecordsCommand>
{
    public ReplaceStorageRecordsCommandValidator()
    {
        RuleFor(command => command.Records).Must(records => records is not null && records.Count <= 3000)
            .WithMessage("A backup can contain at most 3,000 storage records.");
        RuleForEach(command => command.Records).Must(pair =>
                HotelRecord.IsValidKey(pair.Key) && HotelRecord.IsValidJson(pair.Value))
            .WithMessage("Every backup item must have a valid storage key and JSON value.");
    }
}

public sealed class ReplaceStorageRecordsHandler(IHotelRecordRepository repository, IClock clock)
    : IRequestHandler<ReplaceStorageRecordsCommand>
{
    public Task Handle(ReplaceStorageRecordsCommand request, CancellationToken cancellationToken)
    {
        var records = request.Records.Select(pair => HotelRecord.Create(pair.Key, pair.Value, clock.UtcNow)).ToArray();
        return repository.ReplaceAllAsync(records, cancellationToken);
    }
}
