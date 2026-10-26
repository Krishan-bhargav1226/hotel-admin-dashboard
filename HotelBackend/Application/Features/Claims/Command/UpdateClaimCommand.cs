using Application.Interfaces.Repositories.Claims;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Claims.Command
{
    public class UpdateClaimCommand:IRequest<Result<int>>
    {
        public UpdateClaimCommand(int id, CreateClaimCommand createClaimCommand)
        {
            Id = id;
            CreateClaimCommand = createClaimCommand;
        }

        public int Id { get; set; }
        public CreateClaimCommand CreateClaimCommand { get; set; }
    }
    internal class UpdateClaimCommandHandler : IRequestHandler<UpdateClaimCommand, Result<int>>
    {
        private readonly IClaimRepository _repositoary;
        private readonly UserManager<User> _userManager;

        public UpdateClaimCommandHandler(IClaimRepository repositoary, UserManager<User> userManager)
        {
            _repositoary = repositoary;
            _userManager = userManager;
        }

        public async Task<Result<int>> Handle(UpdateClaimCommand request, CancellationToken cancellationToken)
        {
            var userId = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == request.CreateClaimCommand.UserId.ToString());
            if (userId == null)
            {
                return Result<int>.BadRequest("User id not found");
            }

            var updateClaim=await _repositoary.Update(request.Id, request.CreateClaimCommand);
            if (updateClaim == true)
            {
                return Result<int>.Success("Updated......");
            }
            else
            {
                return Result<int>.BadRequest("Id not found");
            }

        }
    }
}
