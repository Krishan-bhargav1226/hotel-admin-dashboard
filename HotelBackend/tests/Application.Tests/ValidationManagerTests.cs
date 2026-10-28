using Application.Common.Exceptions;
using Application.Features.Commons;
using Domain.Commons.Enums.Users;

namespace Application.Tests;

public class ValidationManagerTests
{
    private readonly ValidationManager _manager = new(null!, null!);

    [Theory]
    [InlineData("9876543210", true)]
    [InlineData("123", false)]
    [InlineData("abcdefghij", false)]
    [InlineData("", false)]
    public void Phone_numbers_match_ten_digits(string value, bool expected)
    {
        Assert.Equal(expected, ValidationManager.IsValidPhoneNumber(value));
    }

    [Fact]
    public void Password_rejects_blank_and_short_values()
    {
        Assert.Throws<BadRequestException>(() => _manager.ValidatePassword(""));
        Assert.Throws<BadRequestException>(() => _manager.ValidatePassword("12345"));
    }

    [Fact]
    public void Password_accepts_the_minimum_length()
    {
        _manager.ValidatePassword("123456");
    }

    [Fact]
    public void Enum_rejects_undefined_values_and_allows_null()
    {
        _manager.ValidateEnum<Gender>(null);
        _manager.ValidateEnum<Gender>((int)Gender.Male);
        var error = Assert.Throws<BadRequestException>(() => _manager.ValidateEnum<Gender>(999));
        Assert.Contains("Gender", error.Message);
    }
}
