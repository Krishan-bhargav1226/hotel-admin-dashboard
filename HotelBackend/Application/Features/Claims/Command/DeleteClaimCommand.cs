using Application.Interfaces.Repositories.Claims;
using MediatR;
using Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Claims.Command
{
    public class DeleteClaimCommand:IRequest<Result<int>>
    {
        public int Id { get; set; }

        public DeleteClaimCommand(int id)
        {
            Id = id;
        }
    }
    internal class DeleteClaimCommandHandler : IRequestHandler<DeleteClaimCommand, Result<int>>
    {
        private readonly IClaimRepository _repositoary;

        public DeleteClaimCommandHandler(IClaimRepository repositoary)
        {
            _repositoary = repositoary;
        }

        public async Task<Result<int>> Handle(DeleteClaimCommand request, CancellationToken cancellationToken)
        {
            var claimDelete=await _repositoary.Delete(request.Id);
            if (claimDelete==true)
            {
                return Result<int>.Success("Deleted......");  
            }
            return Result<int>.BadRequest("Id not found");
        }
    }
}
