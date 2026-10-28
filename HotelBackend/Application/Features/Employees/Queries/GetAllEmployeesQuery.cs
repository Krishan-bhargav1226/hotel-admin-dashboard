using Application.Dto.Employees;
using Application.Features.Commons;
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
    public string? Search { get; set; }
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

        var query = _queryContext.Repository<Employee>().Entities
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
            .Where(e => !e.IsDeleted && e.OrganizationId == userOrgInfo.OrganizationId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(e =>
                (e.User != null && e.User.FirstName.ToLower().Contains(search)) ||
                (e.User != null && e.User.LastName != null && e.User.LastName.ToLower().Contains(search)) ||
                (e.User != null && e.User.Email.ToLower().Contains(search)) ||
                (e.User != null && e.User.PhoneNumber != null && e.User.PhoneNumber.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var name = request.Name.Trim().ToLower();
            query = query.Where(e =>
                (e.User != null && e.User.FirstName.ToLower().Contains(name)) ||
                (e.User != null && e.User.LastName != null && e.User.LastName.ToLower().Contains(name)));
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var email = request.Email.Trim().ToLower();
            query = query.Where(e => e.User != null && e.User.Email.ToLower().Contains(email));
        }

        if (!string.IsNullOrWhiteSpace(request.MobileNumber))
        {
            var mobile = request.MobileNumber.Trim();
            query = query.Where(e => e.User != null && e.User.PhoneNumber != null && e.User.PhoneNumber.Contains(mobile));
        }

        query = query.OrderByDescending(e => e.CreatedDate);

        return await ListQuery.ToPagedResultAsync<Employee, GetEmployeeDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
