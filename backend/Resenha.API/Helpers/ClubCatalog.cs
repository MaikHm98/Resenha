using Resenha.API.DTOs.Auth;

namespace Resenha.API.Helpers
{
    public static class ClubCatalog
    {
        private static readonly List<ClubOptionDTO> Clubs = new()
        {
            // Serie A
            Club("ATH", "Athletico-PR", "atletico-paranaense"),
            Club("CAM", "Atletico-MG", "atletico-mineiro"),
            Club("BAH", "Bahia", "bahia"),
            Club("BOT", "Botafogo", "botafogo"),
            Club("RBB", "Bragantino", "bragantino"),
            Club("CEA", "Ceara", "ceara"),
            Club("COR", "Corinthians", "corinthians"),
            Club("CRU", "Cruzeiro", "cruzeiro"),
            Club("FLA", "Flamengo", "flamengo"),
            Club("FLU", "Fluminense", "fluminense"),
            Club("FOR", "Fortaleza", "fortaleza"),
            Club("GRE", "Gremio", "gremio"),
            Club("INT", "Internacional", "internacional"),
            Club("JUV", "Juventude", "juventude"),
            Club("MIR", "Mirassol", "mirassol"),
            Club("PAL", "Palmeiras", "palmeiras"),
            Club("SAN", "Santos", "santos"),
            Club("SAO", "Sao Paulo", "sao-paulo"),
            Club("SPT", "Sport", "sport-recife"),
            Club("VAS", "Vasco", "vasco-da-gama"),

            // Serie B
            Club("AMG", "America-MG", "america-mineiro"),
            Club("AVA", "Avai", "avai"),
            Club("CAP", "Chapecoense", "chapecoense"),
            Club("CFC", "Coritiba", "coritiba"),
            ClubUrl("CRI", "Criciuma", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Crici%C3%BAma_EC_2025_crest.svg/langpt-330px-Crici%C3%BAma_EC_2025_crest.svg.png"),
            Club("CUI", "Cuiaba", "cuiaba"),
            Club("FER", "Ferroviaria", "ferroviaria"),
            ClubUrl("GOI", "Goias", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Goi%C3%A1s_Esporte_Clube_logo.svg/langpt-330px-Goi%C3%A1s_Esporte_Clube_logo.svg.png"),
            Club("NOV", "Novorizontino", "gremio-novorizontino"),
            Club("OPE", "Operario-PR", "operario-pr"),
            ClubUrl("PAY", "Paysandu", "https://upload.wikimedia.org/wikipedia/pt/thumb/2/2f/PaysanduSC.png/330px-PaysanduSC.png"),
            Club("REM", "Remo", "remo"),
            Club("ABC", "Atletico-GO", "atletico-goianiense"),
            ClubUrl("ATHB", "Athletic Club", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Athletic_Club_%28Minas_Gerais%29.svg/langpt-330px-Athletic_Club_%28Minas_Gerais%29.svg.png"),
            Club("BOTSP", "Botafogo-SP", "botafogo-sp"),
            Club("CRB", "CRB", "crb"),
            ClubUrl("VIL", "Vila Nova", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Vila_Nova_Logo_Oficial.svg/langpt-330px-Vila_Nova_Logo_Oficial.svg.png"),
            Club("VOL", "Volta Redonda", "volta-redonda"),
            ClubUrl("AMZ", "Amazonas", "https://upload.wikimedia.org/wikipedia/pt/thumb/7/74/AmazonasFC.png/330px-AmazonasFC.png"),
            Club("PON", "Ponte Preta", "ponte-preta"),
        };

        public static List<ClubOptionDTO> GetAll()
            => Clubs.OrderBy(c => c.Nome).ToList();

        public static ClubOptionDTO? GetByCode(string? codigo)
        {
            if (string.IsNullOrWhiteSpace(codigo))
                return null;

            return Clubs.FirstOrDefault(c => c.Codigo == codigo.Trim().ToUpperInvariant());
        }

        private static ClubOptionDTO Club(string codigo, string nome, string slug)
            => new()
            {
                Codigo = codigo,
                Nome = nome,
                EscudoUrl = $"https://logodetimes.com/times/{slug}/logo-{slug}-256.png"
            };

        private static ClubOptionDTO ClubUrl(string codigo, string nome, string escudoUrl)
            => new()
            {
                Codigo = codigo,
                Nome = nome,
                EscudoUrl = escudoUrl
            };
    }
}
