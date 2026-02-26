using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Captain;
using Resenha.API.Services;
using System.Security.Claims;

namespace Resenha.API.Controllers
{
    [ApiController]
    [Authorize]
    public class CaptainController : ControllerBase
    {
        private readonly CaptainService _captainService;

        public CaptainController(CaptainService captainService)
        {
            _captainService = captainService;
        }

        private ulong GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return ulong.Parse(claim!);
        }

        // POST /api/groups/{groupId}/captain/draw
        // Admin sorteia o capitão inicial. Só funciona se não houver ciclo ATIVO.
        [HttpPost("api/groups/{groupId}/captain/draw")]
        public IActionResult DrawCaptain(ulong groupId)
        {
            try
            {
                var response = _captainService.DrawCaptain(GetUserId(), groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // GET /api/groups/{groupId}/captain
        // Retorna o status atual: capitão, desafiante pendente e lista de bloqueados.
        [HttpGet("api/groups/{groupId}/captain")]
        public IActionResult GetStatus(ulong groupId)
        {
            try
            {
                var response = _captainService.GetStatus(groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/groups/{groupId}/captain/challenge
        // Membro não-bloqueado registra desafio ao capitão.
        [HttpPost("api/groups/{groupId}/captain/challenge")]
        public IActionResult Challenge(ulong groupId)
        {
            try
            {
                var response = _captainService.Challenge(GetUserId(), groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/groups/{groupId}/captain/result
        // Admin registra o resultado do desafio pendente.
        // Body: { "resultado": "CAPITAO" | "DESAFIANTE" }
        [HttpPost("api/groups/{groupId}/captain/result")]
        public IActionResult RegisterResult(ulong groupId, [FromBody] ChallengeResultDTO dto)
        {
            try
            {
                var response = _captainService.RegisterResult(GetUserId(), groupId, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}
