using System.Linq;
using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class JobApplicationRequestValidator : AbstractValidator<JobApplicationRequest>
{
    private static readonly string[] AllowedStages = ["Applied", "Screen", "Interview", "Offer", "Hired", "Rejected"];

    public JobApplicationRequestValidator()
    {
        RuleFor(x => x.JobOpeningId).NotEmpty();
        RuleFor(x => x.CandidateName).NotEmpty();
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).MaximumLength(32);
        RuleFor(x => x.ResumeUrl)
            .Must(url => string.IsNullOrWhiteSpace(url) || Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("ResumeUrl must be a valid absolute URI");
        RuleFor(x => x.Notes).MaximumLength(2048);
        RuleFor(x => x.Stage)
            .Must(stage => stage is null || AllowedStages.Contains(stage))
            .WithMessage("Stage must be one of: Applied, Screen, Interview, Offer, Hired, Rejected");
    }
}
