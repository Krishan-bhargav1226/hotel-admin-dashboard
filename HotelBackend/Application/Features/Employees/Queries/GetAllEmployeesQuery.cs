using Application.Dto.Employees;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Employees;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Employees.Queries;

public class GetAllEmployeesQuery : IRequest<PaginatedResult<GetEmployeeDto>>
{
    public string? Email { get; set; }
    public string? MobileNumber { get; set; }
    public string? Name { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllEmployeesQueryHandler : IRequestHandler<GetAllEmployeesQuery, PaginatedResult<GetEmployeeDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IMapper _mapper;

    public GetAllEmployeesQueryHandler(IQueryContext queryContext, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository, IMapper mapper)
    {
        _queryContext = queryContext;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetEmployeeDto>> Handle(GetAllEmployeesQuery request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return PaginatedResult<GetEmployeeDto>.Create(new List<GetEmployeeDto>(), 0, request.PageNumber, request.PageSize, 400);
        }

        var search = request;

        var queryable = _queryContext.Repository<Employee>().Entities
            .Include(e => e.User)
                .ThenInclude(u => u.UserProfile)
            .Include(e => e.User)
                .ThenInclude(u => u.UserAddress)
                    .ThenInclude(ua => ua.City)
            .Include(e => e.User)
                .ThenInclude(u => u.UserAddress)
                    .ThenInclude(ua => ua.State)
            .Include(e => e.User)
                .ThenInclude(u => u.UserAddress)
                    .ThenInclude(ua => ua.Country)
            .Include(e => e.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .Where(e => !e.IsDeleted
                && (string.IsNullOrEmpty(search.Name) || e.User.FirstName.ToLower().Contains(search.Name.ToLower()) || e.User.LastName.ToLower().Contains(search.Name.ToLower()))
                && (string.IsNullOrEmpty(search.MobileNumber) || e.User.PhoneNumber.Contains(search.MobileNumber))
                && (string.IsNullOrEmpty(search.Email) || e.User.Email.ToLower().Contains(search.Email.ToLower())))
            .AsQueryable();

        var count = await queryable.CountAsync(cancellationToken);

        var employees = await queryable
            .OrderByDescending(e => e.CreatedDate)
            .Skip((search.PageNumber - 1) * search.PageSize)
            .Take(search.PageSize)
            .ToListAsync(cancellationToken);

        var employeeDtos = _mapper.Map<List<GetEmployeeDto>>(employees);

        return PaginatedResult<GetEmployeeDto>.Create(employeeDtos, count, search.PageNumber, search.PageSize, 200);
    }
}
