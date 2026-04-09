namespace Resenha.API.DTOs.Matches
{
    public class DesafioPartidaStatusDTO
    {
        public ulong IdPartida { get; set; }
        public ulong IdGrupo { get; set; }
        public DateTime DataHoraJogo { get; set; }
        public string StatusPartida { get; set; } = string.Empty;
        public string StatusDesafio { get; set; } = string.Empty;
        public int TotalConfirmados { get; set; }
        public int MinimoConfirmados { get; set; }
        public int GoleirosConfirmados { get; set; }
        public int MaximoGoleiros { get; set; }
        public DateTime HorarioLimiteConfirmacao { get; set; }
        public bool ConfirmacoesEncerradas { get; set; }
        public bool PodeIniciarMontagem { get; set; }
        public bool UsuarioEhCapitao { get; set; }
        public bool UsuarioEhCapitaoAtual { get; set; }
        public bool UsuarioEhDesafiante { get; set; }
        public bool UsuarioPodeInteragir { get; set; }
        public bool UsuarioPodeEscolherParidade { get; set; }
        public bool UsuarioPodeInformarNumero { get; set; }
        public bool UsuarioPodeEscolherJogadorLinha { get; set; }
        public bool UsuarioPodeEscolherParidadeGoleiro { get; set; }
        public bool UsuarioPodeInformarNumeroGoleiro { get; set; }
        public bool UsuarioPodeEscolherGoleiro { get; set; }
        public bool PossuiDesafianteDefinido { get; set; }
        public bool RequerDefinicaoManualGoleiro { get; set; }
        public string? ParidadeCapitaoAtual { get; set; }
        public string? ParidadeDesafiante { get; set; }
        public bool CapitaoAtualJaInformouNumero { get; set; }
        public bool DesafianteJaInformouNumero { get; set; }
        public int? NumeroCapitaoAtual { get; set; }
        public int? NumeroDesafiante { get; set; }
        public int? SomaParImparLinha { get; set; }
        public string? ParidadeCapitaoAtualGoleiro { get; set; }
        public string? ParidadeDesafianteGoleiro { get; set; }
        public bool CapitaoAtualJaInformouNumeroGoleiro { get; set; }
        public bool DesafianteJaInformouNumeroGoleiro { get; set; }
        public int? NumeroCapitaoAtualGoleiro { get; set; }
        public int? NumeroDesafianteGoleiro { get; set; }
        public int? SomaParImparGoleiro { get; set; }
        public List<string> Alertas { get; set; } = new();
        public List<string> Bloqueios { get; set; } = new();
        public CapitaoDesafioDTO? CapitaoAtual { get; set; }
        public CapitaoDesafioDTO? Desafiante { get; set; }
        public CapitaoDesafioDTO? VencedorParImparLinha { get; set; }
        public CapitaoDesafioDTO? ProximoCapitaoEscolha { get; set; }
        public CapitaoDesafioDTO? VencedorParImparGoleiro { get; set; }
        public CapitaoDesafioDTO? ProximoCapitaoEscolhaGoleiro { get; set; }
        public TimeMontagemDesafioDTO? TimeCapitaoAtual { get; set; }
        public TimeMontagemDesafioDTO? TimeDesafiante { get; set; }
        public List<JogadorDisponivelDesafioDTO> JogadoresLinhaDisponiveis { get; set; } = new();
        public List<JogadorDisponivelDesafioDTO> GoleirosDisponiveis { get; set; } = new();
    }

    public class CapitaoDesafioDTO
    {
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
    }

    public class TimeMontagemDesafioDTO
    {
        public int NumeroTime { get; set; }
        public ulong IdCapitao { get; set; }
        public string NomeCapitao { get; set; } = string.Empty;
        public List<JogadorDisponivelDesafioDTO> Jogadores { get; set; } = new();
    }

    public class JogadorDisponivelDesafioDTO
    {
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Goleiro { get; set; }
    }
}
