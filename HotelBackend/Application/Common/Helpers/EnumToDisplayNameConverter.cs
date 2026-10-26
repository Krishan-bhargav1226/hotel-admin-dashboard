using AutoMapper;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Application.Commons.Helpers;
public class EnumToDisplayNameConverter<TEnum> : ITypeConverter<TEnum, string>, ITypeConverter<TEnum?, string>
    where TEnum : struct, Enum
{
    // Handles non-nullable enums
    public string Convert(TEnum source, string destination, ResolutionContext context)
    {
        return GetEnumDisplayName(source);
    }

    // Handles nullable enums
    public string Convert(TEnum? source, string destination, ResolutionContext context)
    {
        return source.HasValue ? GetEnumDisplayName(source.Value) : null;
    }

    private string GetEnumDisplayName(TEnum enumValue)
    {
        return typeof(TEnum).GetField(enumValue.ToString())?
               .GetCustomAttribute<DisplayAttribute>()?.Name ?? enumValue.ToString();
    }
}


