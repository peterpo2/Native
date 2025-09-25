using System;

namespace Native.Api.DTOs;

public record CreateTaskAttachmentRequest(
    string FileName,
    string Url,
    string? Provider,
    Guid? LinkedById);
