using Application.Dto.Employees;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Employees;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Employees.Queries;

public class GetEmployeeByIdQuery : IRequest<Result<GetEmployeeDto>>
{
    [Required]
    public int Id { get; set; }

    public GetEmployeeByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetEmployeeByIdQueryHandler : IRequestHandler<GetEmployeeByIdQuery, Result<GetEmployeeDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IMapper _mapper;

    public GetEmployeeByIdQueryHandler(IQueryContext queryContext, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository, IMapper mapper)
    {
        _queryContext = queryContext;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _mapper = mapper;
    }

    public async Task<Result<GetEmployeeDto>> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<GetEmployeeDto>.BadRequest("Organization not found.");
        }

        var employee = await _queryContext.Repository<Employee>().Entities
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
            .FirstOrDefaultAsync(e => e.Id == request.Id && !e.IsDeleted, cancellationToken);

        if (employee == null)
        {
            return Result<GetEmployeeDto>.NotFound("Employee not found.");
        }

        var employeeDto = _mapper.Map<GetEmployeeDto>(employee);
        return Result<GetEmployeeDto>.Success(employeeDto, "Employee retrieved successfully.");
    }
}
