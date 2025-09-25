using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class JobApplicationRequestValidator : AbstractValidator<JobApplicationRequest>
{
    public JobApplicationRequestValidator()
    {
        RuleFor(x => x.CandidateName).NotEmpty();
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Stage).NotEmpty();
    }
}
