using EzProcess.Caching;
using EzProcess.Core.Identity.Interfaces;
using EzProcess.Core.Models;
using EzProcess.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EzProcess.Core.Identity
{
    public class AccountManager : IAccountManager
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private ICacheBase _cache;
        private readonly ApplicationCache _appCache;

        public AccountManager(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IHttpContextAccessor httpAccessor,
            ICacheBase cache)
        {
            _context = context;
            _context.CurrentUserId = httpAccessor.HttpContext?.User.FindFirst(ClaimConstants.Subject)?.Value?.Trim();
            _userManager = userManager;
            _roleManager = roleManager;
            _cache = cache;
            _appCache = new ApplicationCache(context, cache);
        }

        public async Task<ApplicationUser> GetUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }

        public async Task<ApplicationUser> GetUserByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<IList<string>> GetUserRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<(ApplicationUser User, string[] Roles)?> GetUserAndRolesAsync(string userId)
        {
            var user = (await _appCache.GetUsersAsync()).AsEnumerable().FirstOrDefault(u => u.Id == userId);

            if (user == null)
                return null;

            var userRoleIds = user.Roles.Select(r => r.RoleId).ToList();

            var roles = await _context.Roles
                .Where(r => userRoleIds.Contains(r.Id))
                .Select(r => r.Name)
                .ToArrayAsync();

            return (user, roles);
        }

        public async Task<List<(ApplicationUser User, string[] Roles)>> GetUsersAndRolesAsync(int page, int pageSize)
        {
            var usersQuery = (await _appCache.GetUsersAsync()).AsEnumerable();

            if (page != -1)
                usersQuery = usersQuery.Skip((page - 1) * pageSize);

            if (pageSize != -1)
                usersQuery = usersQuery.Take(pageSize);

            var users = usersQuery.ToList();

            var userRoleIds = users.SelectMany(u => u.Roles.Select(r => r.RoleId)).ToList();

            var roles = _appCache.GetRolesAsync().Result.Where(r => userRoleIds.Contains(r.Id)).ToArray();

            return users
                .Select(u => (u, roles.Where(r => u.Roles.Select(ur => ur.RoleId).Contains(r.Id)).Select(r => r.Name).ToArray()))
                .ToList();
        }

        public async Task<List<ApplicationUser>> GetUsersAsync(int page, int pageSize, bool includeRootUser = false)
        {
            var usersQuery = (await _appCache.GetUsersAsync()).AsEnumerable();

            if(!includeRootUser)
            {
                usersQuery = usersQuery.Where(x => x.NormalizedUserName != "ISOFTVN");
            }

            if (page != -1)
                usersQuery = usersQuery.Skip((page - 1) * pageSize);

            if (pageSize != -1)
                usersQuery = usersQuery.Take(pageSize);

            return usersQuery.ToList();
        }

        public async Task<(bool Succeeded, string[] Errors)> CreateUserAsync(ApplicationUser user, IEnumerable<string> roles, string password)
        {
            _cache.Remove(CacheKeys.AllUsers);
            _cache.Remove(CacheKeys.AllRoles);
            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            user = await _userManager.FindByNameAsync(user.UserName);

            try
            {
                result = await this._userManager.AddToRolesAsync(user, roles.Distinct());
            }
            catch
            {
                await DeleteUserAsync(user);
                throw;
            }

            if (!result.Succeeded)
            {
                await DeleteUserAsync(user);
                return (false, result.Errors.Select(e => e.Description).ToArray());
            }

            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> UpdateUserAsync(ApplicationUser user)
        {
            return await UpdateUserAsync(user, null);
        }

        public async Task<(bool Succeeded, string[] Errors)> UpdateUserAsync(ApplicationUser user, IEnumerable<string> roles)
        {
            _cache.Remove(CacheKeys.AllUsers);
            _cache.Remove(CacheKeys.AllRoles);
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            if (roles != null)
            {
                var userRoles = await _userManager.GetRolesAsync(user);

                var rolesToRemove = userRoles.Except(roles).ToArray();
                var rolesToAdd = roles.Except(userRoles).Distinct().ToArray();

                if (rolesToRemove.Any())
                {
                    result = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                    if (!result.Succeeded)
                        return (false, result.Errors.Select(e => e.Description).ToArray());
                }

                if (rolesToAdd.Any())
                {
                    result = await _userManager.AddToRolesAsync(user, rolesToAdd);
                    if (!result.Succeeded)
                        return (false, result.Errors.Select(e => e.Description).ToArray());
                }
            }
            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(ApplicationUser user, string newPassword)
        {
            string resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> UpdatePasswordAsync(ApplicationUser user, string currentPassword, string newPassword)
        {
            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            return (true, new string[] { });
        }

        public async Task<bool> CheckPasswordAsync(ApplicationUser user, string password)
        {
            if (!await _userManager.CheckPasswordAsync(user, password))
            {
                if (!_userManager.SupportsUserLockout)
                    await _userManager.AccessFailedAsync(user);

                return false;
            }

            return true;
        }

        public async Task<(bool Succeeded, string[] Errors)> CanDeleteUserAsync(string userId, string currentUserId)
        {
            var adminRole = await _context.Roles.Include(x => x.Users).FirstOrDefaultAsync(x => x.Name == SystemConstants.Administrator);
            if (adminRole != null)
            {
                if (!adminRole.Users.Any(x => x.UserId == currentUserId))
                {
                    return (false, new string[] { Resource.Instance.GetString(Constants.ERR_CANNOT_EDIT_ADMIN_ACCOUNT) });
                }
                if (adminRole.Users.Count == 1 && adminRole.Users.Any(x => x.UserId == userId))
                {
                    return (false, new string[] { Resource.Instance.GetString(Constants.ERR_CANNOT_DELETE_LAST_ADMIN) });
                }
            }
            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> CanEditAdminUserAsync(string userId, string currentUserId, bool isActive)
        {
            var adminRole = await _context.Roles.Include(x => x.Users).FirstOrDefaultAsync(x => x.Name == SystemConstants.Administrator);
            if (adminRole != null)
            {
                if (!adminRole.Users.Any(x => x.UserId == currentUserId))
                {
                    return (false, new string[] { Resource.Instance.GetString(Constants.ERR_CANNOT_EDIT_ADMIN_ACCOUNT) });
                }
                var adminUserIds = adminRole.Users.Select(u => u.UserId).ToList();
                var adminActiveUsers = _context.Users.Count(x => x.IsEnabled && adminUserIds.Contains(x.Id));
                if (adminActiveUsers == 1 && adminRole.Users.Any(x => x.UserId == userId) && !isActive)
                {
                    return (false, new string[] { Resource.Instance.GetString(Constants.ERR_CANNOT_DEACTIVE_LAST_ADMIN) });
                }
            }
            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> DeleteUserAsync(string userId)
        {
            _cache.Remove(CacheKeys.AllUsers);
            _cache.Remove(CacheKeys.AllRoles);
            var user = await _userManager.FindByIdAsync(userId);

            if (user != null)
                return await DeleteUserAsync(user);

            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> DeleteUserAsync(ApplicationUser user)
        {
            _cache.Remove(CacheKeys.AllUsers);
            _cache.Remove(CacheKeys.AllRoles);
            var result = await _userManager.DeleteAsync(user);
            return (result.Succeeded, result.Errors.Select(e => e.Description).ToArray());
        }

        public async Task<ApplicationRole> GetRoleByIdAsync(string roleId)
        {
            var allRoles = await _appCache.GetRolesAsync();
            return allRoles.FirstOrDefault(r => r.Id == roleId);
        }

        public async Task<ApplicationRole> GetRoleByNameAsync(string roleName)
        {
            var allRoles = await _appCache.GetRolesAsync();
            return allRoles.FirstOrDefault(r => r.Name == roleName);
        }

        public async Task<ApplicationRole> GetRoleLoadRelatedAsync(string roleName)
        {
            var allRoles = await _appCache.GetRolesAsync();
            return allRoles.FirstOrDefault(r => r.Name == roleName);
        }

        public async Task<List<ApplicationRole>> GetRolesByNameAsync(IEnumerable<string> roles)
        {
            var allRoles = await _appCache.GetRolesAsync();
            return allRoles.Where(r => roles.Contains(r.Name)).ToList();
        }

        public async Task<List<ApplicationRole>> GetRolesLoadRelatedAsync(int page, int pageSize)
        {
            var rolesQuery = (await _appCache.GetRolesAsync()).AsEnumerable();
            if (page != -1)
                rolesQuery = rolesQuery.Skip((page - 1) * pageSize);

            if (pageSize != -1)
                rolesQuery = rolesQuery.Take(pageSize);

            return rolesQuery.ToList();
        }

        public async Task<(bool Succeeded, string[] Errors)> CreateRoleAsync(ApplicationRole role, IEnumerable<string> claims)
        {
            if (claims == null)
                claims = new string[] { };

            string[] invalidClaims = claims.Where(c => ApplicationPermissions.GetPermissionByValue(c) == null).ToArray();
            if (invalidClaims.Any())
                return (false, new[] { "The following claim types are invalid: " + string.Join(", ", invalidClaims) });

            _cache.Remove(CacheKeys.AllUsers);
            _cache.Remove(CacheKeys.AllRoles);

            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());


            role = await _roleManager.FindByNameAsync(role.Name);

            foreach (string claim in claims.Distinct())
            {
                result = await this._roleManager.AddClaimAsync(role, new Claim(ClaimConstants.Permission, ApplicationPermissions.GetPermissionByValue(claim)));

                if (!result.Succeeded)
                {
                    await DeleteRoleAsync(role);
                    return (false, result.Errors.Select(e => e.Description).ToArray());
                }
            }

            return (true, new string[] { });
        }
        
        public async Task<(bool Succeeded, string[] Errors)> UpdateRoleAsync(ApplicationRole role, IEnumerable<string> claims)
        {
            if (claims != null)
            {
                string[] invalidClaims = claims.Where(c => ApplicationPermissions.GetPermissionByValue(c) == null).ToArray();
                if (invalidClaims.Any())
                    return (false, new[] { "The following claim types are invalid: " + string.Join(", ", invalidClaims) });
            }

            _cache.Remove(CacheKeys.AllUsers);
            _cache.Remove(CacheKeys.AllRoles);

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());


            if (claims != null)
            {
                var roleClaims = (await _roleManager.GetClaimsAsync(role)).Where(c => c.Type == ClaimConstants.Permission);
                var roleClaimValues = roleClaims.Select(c => c.Value).ToArray();

                var claimsToRemove = roleClaimValues.Except(claims).ToArray();
                var claimsToAdd = claims.Except(roleClaimValues).Distinct().ToArray();

                if (claimsToRemove.Any())
                {
                    foreach (string claim in claimsToRemove)
                    {
                        result = await _roleManager.RemoveClaimAsync(role, roleClaims.Where(c => c.Value == claim).FirstOrDefault());
                        if (!result.Succeeded)
                            return (false, result.Errors.Select(e => e.Description).ToArray());
                    }
                }

                if (claimsToAdd.Any())
                {
                    foreach (string claim in claimsToAdd)
                    {
                        result = await _roleManager.AddClaimAsync(role, new Claim(ClaimConstants.Permission, ApplicationPermissions.GetPermissionByValue(claim)));
                        if (!result.Succeeded)
                            return (false, result.Errors.Select(e => e.Description).ToArray());
                    }
                }
            }

            return (true, new string[] { });
        }

        public async Task<bool> CanDeleteRoleAsync(string roleId)
        {
            return !await _context.UserRoles.Where(r => r.RoleId == roleId).AnyAsync();
        }

        public async Task<(bool Succeeded, string[] Errors)> DeleteRoleAsync(string roleName)
        {
            _cache.Remove(CacheKeys.AllRoles);
            _cache.Remove(CacheKeys.AllUsers);
            var role = await _roleManager.FindByNameAsync(roleName);

            if (role != null)
                return await DeleteRoleAsync(role);

            return (true, new string[] { });
        }

        public async Task<(bool Succeeded, string[] Errors)> DeleteRoleAsync(ApplicationRole role)
        {
            _cache.Remove(CacheKeys.AllRoles);
            _cache.Remove(CacheKeys.AllUsers);
            var result = await _roleManager.DeleteAsync(role);
            return (result.Succeeded, result.Errors.Select(e => e.Description).ToArray());
        }
    }
}
