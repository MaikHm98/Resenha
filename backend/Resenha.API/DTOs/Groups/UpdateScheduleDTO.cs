using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Groups
{
    public class UpdateScheduleDTO
    {
        [Range(0, 6, ErrorMessage = "Dia da semana deve ser entre 0 (Dom) e 6 (Sab).")]
        public int? DiaSemana { get; set; }

        [MaxLength(5)]
        public string? HorarioFixo { get; set; }
    }
}
