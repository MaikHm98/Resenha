using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Groups;
using Resenha.API.Services;
using System.Security.Claims;

namespace Resenha.API.Controllers
{
    [ApiController]
    [Route("api/groups")]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly GroupService _groupService;

        public GroupController(GroupService groupService)
        {
            _groupService = groupService;
        }

        // Obtém o ID do usuário logado a partir do JWT
        private ulong GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return ulong.Parse(claim!);
        }

        // POST /api/groups
        // Cria um novo grupo. O criador se torna ADMIN automaticamente.
        [HttpPost]
        public IActionResult CreateGroup([FromBody] CreateGroupDTO dto)
        {
            try
            {
                var response = _groupService.CreateGroup(GetUserId(), dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // GET /api/groups/me
        // Lista todos os grupos em que o usuário logado é membro.
        [HttpGet("me")]
        public IActionResult GetMyGroups()
        {
            try
            {
                var response = _groupService.GetMyGroups(GetUserId());
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/groups/{id}/invite
        // Admin convida um usuário pelo email. Retorna o código de convite.
        [HttpPost("{id}/invite")]
        public IActionResult InviteUser(ulong id, [FromBody] InviteUserDTO dto)
        {
            try
            {
                var response = _groupService.InviteUser(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/groups/join
        // Usuário entra em um grupo usando o código de convite.
        [HttpPost("join")]
        public IActionResult JoinGroup([FromBody] JoinGroupDTO dto)
        {
            try
            {
                var response = _groupService.JoinGroup(GetUserId(), dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}
