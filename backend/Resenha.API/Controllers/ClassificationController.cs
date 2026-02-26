using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Classification;
using Resenha.API.Services;
using System.Security.Claims;

namespace Resenha.API.Controllers
{
    [ApiController]
    [Authorize]
    public class ClassificationController : ControllerBase
    {
        private readonly ClassificationService _classificationService;

        public ClassificationController(ClassificationService classificationService)
        {
            _classificationService = classificationService;
        }

        private ulong GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return ulong.Parse(claim!);
        }

        // POST /api/matches/{id}/teams
        // Admin monta os dois times com os jogadores confirmados
        [HttpPost("api/matches/{id}/teams")]
        public IActionResult AssignTeams(ulong id, [FromBody] AssignTeamsDTO dto)
        {
            try
            {
                _classificationService.AssignTeams(GetUserId(), id, dto);
                return Ok(new { mensagem = "Times atribuídos com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // POST /api/matches/{id}/finalize
        // Admin registra o placar e atualiza a classificação
        // Body: { "golsTime1": 3, "golsTime2": 1, "estatisticas": [{ "idUsuario": 1, "gols": 2, "assistencias": 1 }] }
        [HttpPost("api/matches/{id}/finalize")]
        public IActionResult FinalizeMatch(ulong id, [FromBody] FinalizeMatchDTO dto)
        {
            try
            {
                var response = _classificationService.FinalizeMatch(GetUserId(), id, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // GET /api/groups/{groupId}/classification
        // Ranking da temporada ativa
        [HttpGet("api/groups/{groupId}/classification")]
        public IActionResult GetSeasonClassification(ulong groupId)
        {
            try
            {
                var response = _classificationService.GetSeasonClassification(groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // GET /api/groups/{groupId}/classification/all-time
        // Ranking histórico do grupo (todas as temporadas)
        [HttpGet("api/groups/{groupId}/classification/all-time")]
        public IActionResult GetAllTimeClassification(ulong groupId)
        {
            try
            {
                var response = _classificationService.GetAllTimeClassification(groupId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // GET /api/groups/{groupId}/classification/me
        // Estatísticas do usuário logado no grupo (temporada + histórico)
        [HttpGet("api/groups/{groupId}/classification/me")]
        public IActionResult GetMyStats(ulong groupId)
        {
            try
            {
                var (temporada, geral) = _classificationService.GetMyStats(GetUserId(), groupId);
                return Ok(new { temporada, geral });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}
