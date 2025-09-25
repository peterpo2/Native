using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName).MaximumLength(256);
        RuleFor(x => x.Role).MaximumLength(64);
    }
}
