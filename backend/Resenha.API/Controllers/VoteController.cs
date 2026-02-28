using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Vote;
using Resenha.API.Helpers;
using Resenha.API.Services;
using System.Security.Claims;

namespace Resenha.API.Controllers
{
    [ApiController]
    [Authorize]
    public class VoteController : ControllerBase
    {
        private readonly VoteService _voteService;

        public VoteController(VoteService voteService)
        {
            _voteService = voteService;
        }

        private ulong GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return ulong.Parse(claim!);
        }

        // POST /api/matches/{id}/vote/open
        // Admin abre votação de MVP e Bola Murcha após a partida ser finalizada
        [HttpPost("api/matches/{id}/vote/open")]
        public IActionResult OpenVoting(ulong id)
        {
            try
            {
                var response = _voteService.OpenVoting(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/matches/{id}/vote
        // Jogador registra seu voto
        // Body: { "tipo": "MVP", "idUsuarioVotado": 5 }
        [HttpPost("api/matches/{id}/vote")]
        public IActionResult CastVote(ulong id, [FromBody] CastVoteDTO dto)
        {
            try
            {
                var response = _voteService.CastVote(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/matches/{id}/vote/close
        // Admin encerra a votação e apura o resultado
        // Body: { "tipo": "MVP" }
        [HttpPost("api/matches/{id}/vote/close")]
        public IActionResult CloseVoting(ulong id, [FromBody] CloseVoteDTO dto)
        {
            try
            {
                var response = _voteService.CloseVoting(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/matches/{id}/vote/approve
        // Admin aprova o resultado provisório e atualiza a classificação
        // Body: { "tipo": "MVP" }
        [HttpPost("api/matches/{id}/vote/approve")]
        public IActionResult ApproveVoting(ulong id, [FromBody] ApproveVoteDTO dto)
        {
            try
            {
                var response = _voteService.ApproveVoting(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/matches/{id}/vote
        // Status atual da votação (candidatos, votos, vencedor provisório)
        [HttpGet("api/matches/{id}/vote")]
        public IActionResult GetVoteStatus(ulong id)
        {
            try
            {
                var response = _voteService.GetVoteStatus(GetUserId(), id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }
    }
}
