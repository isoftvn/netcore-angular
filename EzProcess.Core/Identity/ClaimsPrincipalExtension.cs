using IdentityModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace EzProcess.Core.Identity
{
    public static class ClaimsPrincipalExtension
    {
        public static string GetCurrentUserId(this ClaimsPrincipal principal)
        {
            return principal.FindFirst(JwtClaimTypes.Subject)?.Value?.Trim();
        }

        public static string GetCurrentUserName(this ClaimsPrincipal principal)
        {
            return principal.FindFirst(JwtClaimTypes.Name)?.Value?.Trim();
        }

        public static IEnumerable<string> GetCurrentUserRoles(this ClaimsPrincipal principal)
        {
            return principal.Claims
                .Where(c => c.Type == JwtClaimTypes.Role)
                .Select(c => c.Value);
        }
    }
}
