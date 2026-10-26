namespace Application.Common.Helpers;

public static class CodeGenerator
{
    public static string Next(string prefix, int existingCount) => $"{prefix}-{(existingCount + 1):D4}";
}
