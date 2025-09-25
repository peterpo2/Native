using FluentValidation;

namespace Native.Api.DTOs.Validators;

public class CreateTaskAttachmentRequestValidator : AbstractValidator<CreateTaskAttachmentRequest>
{
    public CreateTaskAttachmentRequestValidator()
    {
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Url).NotEmpty().Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Url must be a valid absolute URI");
        RuleFor(x => x.Provider).MaximumLength(32);
    }
}
