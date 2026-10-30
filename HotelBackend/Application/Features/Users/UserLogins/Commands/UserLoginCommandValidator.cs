using FluentValidation;

namespace Application.Features.Users;

public sealed class UserLoginCommandValidator : AbstractValidator<UserLoginCommand>
{
    public UserLoginCommandValidator()
    {
        RuleFor(command => command.Code).NotEmpty().MaximumLength(256);
        RuleFor(command => command.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
    }
}
