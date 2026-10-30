using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Expenses;
using Domain.Common.Enums.Hotels;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Expenses.Commands;

public class UpdateExpenseCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateExpenseCommand CreateCommand { get; set; }

    public UpdateExpenseCommand(int id, CreateExpenseCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateExpenseCommandHandler : IRequestHandler<UpdateExpenseCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdateExpenseCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdateExpenseCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<HotelExpense>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Expense does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        await _unitOfWork.Repository<HotelExpense>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Expense updated successfully.");
    }

    private async Task Validate(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<ExpenseCategory>( (int)request.Category );
        _validationManager.ValidateEnum<PaymentMode>( (int)request.PaymentMode );
        await Task.CompletedTask;
    }

}
