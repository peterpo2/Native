using System.Linq;
using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class UpdateApplicationStageRequestValidator : AbstractValidator<UpdateApplicationStageRequest>
{
    private static readonly string[] AllowedStages = ["Applied", "Screen", "Interview", "Offer", "Hired", "Rejected"];

    public UpdateApplicationStageRequestValidator()
    {
        RuleFor(x => x.Stage)
            .NotEmpty()
            .Must(stage => AllowedStages.Contains(stage))
            .WithMessage("Stage must be one of: Applied, Screen, Interview, Offer, Hired, Rejected");
    }
}
