﻿using EzProcess.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EzProcess.Core.Identity.Interfaces
{
    public interface IAccountManager
    {
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<(bool Succeeded, string[] Errors)> CreateRoleAsync(ApplicationRole role, IEnumerable<string> claims);
        Task<(bool Succeeded, string[] Errors)> CreateUserAsync(ApplicationUser user, IEnumerable<string> roles, string password);
        Task<(bool Succeeded, string[] Errors)> DeleteRoleAsync(ApplicationRole role);
        Task<(bool Succeeded, string[] Errors)> DeleteRoleAsync(string roleName);
        Task<(bool Succeeded, string[] Errors)> DeleteUserAsync(ApplicationUser user);
        Task<(bool Succeeded, string[] Errors)> DeleteUserAsync(string userId);
        Task<ApplicationRole> GetRoleByIdAsync(string roleId);
        Task<ApplicationRole> GetRoleByNameAsync(string roleName);
        Task<List<ApplicationRole>> GetRolesByNameAsync(IEnumerable<string> roles);
        Task<ApplicationRole> GetRoleLoadRelatedAsync(string roleName);
        Task<List<ApplicationRole>> GetRolesLoadRelatedAsync(int page, int pageSize);
        Task<(ApplicationUser User, string[] Roles)?> GetUserAndRolesAsync(string userId);
        Task<ApplicationUser> GetUserByEmailAsync(string email);
        Task<ApplicationUser> GetUserByIdAsync(string userId);
        Task<IList<string>> GetUserRolesAsync(ApplicationUser user);
        Task<List<(ApplicationUser User, string[] Roles)>> GetUsersAndRolesAsync(int page, int pageSize);
        Task<List<ApplicationUser>> GetUsersAsync(int page, int pageSize, bool includeRootUser = false);
        Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(ApplicationUser user, string newPassword);
        Task<bool> CanDeleteRoleAsync(string roleId);
        Task<(bool Succeeded, string[] Errors)> CanDeleteUserAsync(string userId, string currentUserId);
        Task<(bool Succeeded, string[] Errors)> CanEditAdminUserAsync(string userId, string currentUserId, bool isActive);
        Task<(bool Succeeded, string[] Errors)> UpdatePasswordAsync(ApplicationUser user, string currentPassword, string newPassword);
        Task<(bool Succeeded, string[] Errors)> UpdateRoleAsync(ApplicationRole role, IEnumerable<string> claims);
        Task<(bool Succeeded, string[] Errors)> UpdateUserAsync(ApplicationUser user);
        Task<(bool Succeeded, string[] Errors)> UpdateUserAsync(ApplicationUser user, IEnumerable<string> roles);
    }
}
