using Resenha.API.DTOs.Auth;

namespace Resenha.API.Helpers
{
    public static class ClubCatalog
    {
        private static readonly List<ClubOptionDTO> Clubs = new()
        {
            // Serie A
            Club("ATH", "Athletico-PR", "athletico-pr"),
            Club("CAM", "Atletico-MG", "atletico-mg"),
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
            Club("VAS", "Vasco", "vasco"),

            // Serie B
            Club("AMG", "America-MG", "america-mineiro"),
            Club("AVA", "Avai", "avai"),
            Club("CAP", "Chapecoense", "chapecoense"),
            Club("CFC", "Coritiba", "coritiba"),
            Club("CRI", "Criciuma", "criciuma"),
            Club("CUI", "Cuiaba", "cuiaba"),
            Club("FER", "Ferroviaria", "ferroviaria"),
            Club("GOI", "Goias", "goias"),
            Club("NOV", "Novorizontino", "novorizontino"),
            Club("OPE", "Operario-PR", "operario-ferroviario"),
            Club("PAY", "Paysandu", "paysandu"),
            Club("REM", "Remo", "remo"),
            Club("ABC", "Atletico-GO", "atletico-goianiense"),
            Club("ATHB", "Athletic Club", "athletic-club-sjdr"),
            Club("BOTSP", "Botafogo-SP", "botafogo-sp"),
            Club("CRB", "CRB", "crb"),
            Club("VIL", "Vila Nova", "vila-nova"),
            Club("VOL", "Volta Redonda", "volta-redonda"),
            Club("AMZ", "Amazonas", "amazonas"),
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
    }
}
