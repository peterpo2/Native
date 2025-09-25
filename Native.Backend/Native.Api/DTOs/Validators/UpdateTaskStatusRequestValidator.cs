using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    private static readonly string[] AllowedStatuses = new[] { "Todo", "InProgress", "Done" };

    public UpdateTaskStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty().Must(status => AllowedStatuses.Contains(status))
            .WithMessage("Status must be one of: Todo, InProgress, Done");
    }
}
