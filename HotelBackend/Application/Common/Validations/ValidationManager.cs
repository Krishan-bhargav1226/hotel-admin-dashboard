using Application.Common;
using Application.Common.Exceptions;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Application.Features.Commons;

public class ValidationManager
{
    private readonly IQueryContext _queryContext;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public ValidationManager(IQueryContext queryContext, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _queryContext = queryContext;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public static bool IsValidPhoneNumber(string number)
    {
        // Check if it's exactly 10 digits and can be converted into long
        return Regex.IsMatch(number, @"^\d{10}$") && long.TryParse(number, out _);
    }

    public void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new BadRequestException("Password cannot be empty.");
        }

        if (password.Length < 8 || password.Length > 30)
            throw new BadRequestException("Password must be 8 to 30 characters.");

        if (!password.Any(char.IsUpper) || !password.Any(char.IsLower) || !password.Any(char.IsDigit))
            throw new BadRequestException("Password must include an uppercase letter, a lowercase letter, and a digit.");
    }

    public async Task ValidateId<T>(int? id) where T : BaseAuditableEntity
    {
        var useOrga = await _userIdAndOrganizationIdRepository.Get();

        if (id != null)
        {
            var check = await _queryContext.Repository<T>().Entities.Where(x => x.Id == id && x.OrganizationId == useOrga.OrganizationId.Value).AnyAsync();

            if (!check)
            {
                throw new BadRequestException($"{typeof(T).Name} Id {id} doesn't exists");
            }
        }
    }

    public void ValidateEnum<TEnum>(int? value) where TEnum : Enum
    {
        if (value != null && !Enum.IsDefined(typeof(TEnum), value))
        {
            throw new BadRequestException($"{typeof(TEnum).Name} value {value} is not valid.");
        }
    }

}
