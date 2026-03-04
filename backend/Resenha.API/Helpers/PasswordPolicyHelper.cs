using System.Text.RegularExpressions;

namespace Resenha.API.Helpers
{
    public static class PasswordPolicyHelper
    {
        private static readonly Regex HasUpper = new("[A-Z]");
        private static readonly Regex HasDigit = new("[0-9]");

        public static bool IsStrong(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return false;

            if (password.Length < 8)
                return false;

            return HasUpper.IsMatch(password) && HasDigit.IsMatch(password);
        }
    }
}
