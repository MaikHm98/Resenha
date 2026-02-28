using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Groups;
using Resenha.API.Helpers;
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
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
                return this.ToErrorResult(ex);
            }
        }

        // PATCH /api/groups/{id}/schedule
        // Admin atualiza o dia e horário fixo do grupo.
        [HttpPatch("{id}/schedule")]
        public IActionResult UpdateSchedule(ulong id, [FromBody] UpdateScheduleDTO dto)
        {
            try
            {
                _groupService.UpdateSchedule(GetUserId(), id, dto.DiaSemana, dto.HorarioFixo);
                return Ok(new { mensagem = "Horário atualizado com sucesso." });
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/groups/{id}/members
        // Admin lista todos os membros ativos do grupo.
        [HttpGet("{id}/members")]
        public IActionResult GetMembers(ulong id)
        {
            try
            {
                var response = _groupService.GetGroupMembers(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/groups/{id}/members
        // Admin adiciona um membro ao grupo pelo email.
        [HttpPost("{id}/members")]
        public IActionResult AddMember(ulong id, [FromBody] AddGroupMemberDTO dto)
        {
            try
            {
                var response = _groupService.AddMemberByEmail(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // DELETE /api/groups/{id}/members/{memberUserId}
        // Admin remove um membro do grupo.
        [HttpDelete("{id}/members/{memberUserId}")]
        public IActionResult RemoveMember(ulong id, ulong memberUserId)
        {
            try
            {
                _groupService.RemoveMember(GetUserId(), id, memberUserId);
                return Ok(new { mensagem = "Membro removido com sucesso." });
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // PATCH /api/groups/{id}/members/{memberUserId}/role
        // Admin promove/rebaixa o perfil de um membro.
        [HttpPatch("{id}/members/{memberUserId}/role")]
        public IActionResult UpdateMemberRole(ulong id, ulong memberUserId, [FromBody] UpdateGroupMemberRoleDTO dto)
        {
            try
            {
                var response = _groupService.UpdateMemberRole(GetUserId(), id, memberUserId, dto.Perfil);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }
    }
}
