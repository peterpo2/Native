using System.Linq;
using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class UpdateTaskDetailsRequestValidator : AbstractValidator<UpdateTaskDetailsRequest>
{
    private static readonly string[] AllowedPriorities = ["Low", "Normal", "High", "Urgent"];

    public UpdateTaskDetailsRequestValidator()
    {
        RuleFor(x => x.Title).MaximumLength(128);
        RuleFor(x => x.Description).MaximumLength(2048);
        RuleFor(x => x.Priority)
            .Must(priority => priority is null || AllowedPriorities.Contains(priority))
            .WithMessage("Priority must be one of: Low, Normal, High, Urgent");
    }
}
