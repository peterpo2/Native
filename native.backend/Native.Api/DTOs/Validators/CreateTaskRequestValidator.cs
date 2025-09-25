using System.Linq;
using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    private static readonly string[] AllowedStatuses = ["Todo", "In Progress", "Review", "Done"];
    private static readonly string[] AllowedPriorities = ["Low", "Normal", "High", "Urgent"];

    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.ProjectId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("ProjectId must be a valid GUID when provided");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Description).MaximumLength(2048);
        RuleFor(x => x.Status)
            .Must(status => status is null || AllowedStatuses.Contains(status))
            .WithMessage("Status must be one of: Todo, In Progress, Review, Done");
        RuleFor(x => x.Priority)
            .Must(priority => priority is null || AllowedPriorities.Contains(priority))
            .WithMessage("Priority must be one of: Low, Normal, High, Urgent");
    }
}
