using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class UpdateJobOpeningRequestValidator : AbstractValidator<UpdateJobOpeningRequest>
{
    public UpdateJobOpeningRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Department).MaximumLength(128);
        RuleFor(x => x.Location).MaximumLength(128);
        RuleFor(x => x.Description).MaximumLength(4000);
    }
}
