namespace Resenha.API.Helpers
{
    public static class PlayerProfileCatalog
    {
        public static readonly string[] PosicoesPrincipais =
        {
            "GOLEIRO",
            "ZAGUEIRO",
            "LATERAL",
            "VOLANTE",
            "MEIA",
            "PONTA",
            "ATACANTE"
        };

        public static readonly string[] PesDominantes =
        {
            "DIREITO",
            "ESQUERDO",
            "AMBIDESTRO"
        };

        public static bool IsValidPosicaoPrincipal(string? value)
            => !string.IsNullOrWhiteSpace(value) &&
               PosicoesPrincipais.Contains(Normalize(value), StringComparer.OrdinalIgnoreCase);

        public static bool IsValidPeDominante(string? value)
            => !string.IsNullOrWhiteSpace(value) &&
               PesDominantes.Contains(Normalize(value), StringComparer.OrdinalIgnoreCase);

        public static string? NormalizeOptionalPosicaoPrincipal(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var normalized = Normalize(value);
            return IsValidPosicaoPrincipal(normalized) ? normalized : null;
        }

        public static string? NormalizeOptionalPeDominante(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var normalized = Normalize(value);
            return IsValidPeDominante(normalized) ? normalized : null;
        }

        private static string Normalize(string value)
            => value.Trim().ToUpperInvariant();
    }
}
