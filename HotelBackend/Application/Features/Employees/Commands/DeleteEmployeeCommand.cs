using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Employees;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Employees.Commands;

public class DeleteEmployeeCommand : IRequest<Result<bool>>
{
    [Required]
    public int Id { get; set; }

    public DeleteEmployeeCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public DeleteEmployeeCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _unitOfWork = unitOfWork;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public async Task<Result<bool>> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<bool>.BadRequest("Organization not found.");
        }

        var employeeExists = await _unitOfWork.Repository<Employee>().Entities
            .AnyAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (!employeeExists)
        {
            return Result<bool>.BadRequest("Employee not found.");
        }

        await _unitOfWork.Repository<Employee>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);

        return Result<bool>.Success(true, "Employee deleted successfully.");
    }
}
