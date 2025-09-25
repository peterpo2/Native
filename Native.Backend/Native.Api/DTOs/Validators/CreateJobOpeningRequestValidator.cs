using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class CreateJobOpeningRequestValidator : AbstractValidator<CreateJobOpeningRequest>
{
    public CreateJobOpeningRequestValidator()
    {
        RuleFor(x => x.OrgId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Department).MaximumLength(128);
        RuleFor(x => x.Location).MaximumLength(128);
        RuleFor(x => x.Description).MaximumLength(4000);
    }
}
