using Application.Interfaces.Repositories.Menus;
using MediatR;
using Shared;

namespace Application.Features.Menus.Commands;

public class DeleteMenuCommand : IRequest<Result<int>>
{
    public Guid Id { get; set; }
    public DeleteMenuCommand(Guid id)
    {
        Id = id;
    }
}
internal class DeleteMenuCommandHandler : IRequestHandler<DeleteMenuCommand, Result<int>>
{
    private readonly IMenuRepository _menuRepository;
    public DeleteMenuCommandHandler(IMenuRepository menuRepository)
    {
        _menuRepository = menuRepository;
    }
    public async Task<Result<int>> Handle(DeleteMenuCommand request, CancellationToken cancellationToken)
    {
        var data = await _menuRepository.Delete(request.Id);
      
        if (data == false)
        {
            return Result<int>.BadRequest("Id not found");
        }

        return Result<int>.Success("Deleted");
    }
}
