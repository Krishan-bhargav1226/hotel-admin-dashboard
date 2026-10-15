using HotelAdmin.Application.Abstractions;
using HotelAdmin.Domain.Entities;
using FluentValidation;
using MediatR;

namespace HotelAdmin.Application.Storage.Commands;

public sealed record DeleteStorageRecordCommand(string Key) : IRequest<bool>;

public sealed class DeleteStorageRecordCommandValidator : AbstractValidator<DeleteStorageRecordCommand>
{
    public DeleteStorageRecordCommandValidator() =>
        RuleFor(command => command.Key).Must(HotelRecord.IsValidKey).WithMessage("The storage key is invalid.");
}

public sealed class DeleteStorageRecordHandler(IHotelRecordRepository repository)
    : IRequestHandler<DeleteStorageRecordCommand, bool>
{
    public Task<bool> Handle(DeleteStorageRecordCommand request, CancellationToken cancellationToken) =>
        repository.DeleteAsync(request.Key, cancellationToken);
}
