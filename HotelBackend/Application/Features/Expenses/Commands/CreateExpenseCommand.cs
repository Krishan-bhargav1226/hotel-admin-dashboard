using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Expenses;
using Domain.Entities.Hotels;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Expenses.Commands;

public class CreateExpenseCommand : IRequest<Result<int>>, ICreateMapFrom<HotelExpense>
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public DateOnly ExpenseDate { get; set; }
    [StringLength(150)]
    public string? PaidTo { get; set; }
    [StringLength(500)]
    public string? Notes { get; set; }
}

internal class CreateExpenseCommandHandler : IRequestHandler<CreateExpenseCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateExpenseCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<HotelExpense>(request);

        await _unitOfWork.Repository<HotelExpense>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Expense created successfully.");
    }

    private async Task Validate(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<ExpenseCategory>( (int)request.Category );
        _validationManager.ValidateEnum<PaymentMode>( (int)request.PaymentMode );
        await Task.CompletedTask;
    }

}
