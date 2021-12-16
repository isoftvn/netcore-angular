

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EzProcess.Authorization
{
    public class Policies
    {
        public const string ViewAllUsersPolicy = "ViewAllUsersPolicy";
        public const string ManageAllUsersPolicy = "ManageAllUsersPolicy";
        public const string ViewAllRolesPolicy = "ViewAllRolesPolicy";
        public const string ViewRoleByRoleNamePolicy = "ViewRoleByRoleNamePolicy";
        public const string ManageAllRolesPolicy = "ManageAllRolesPolicy";
        public const string AssignAllowedRolesPolicy = "AssignAllowedRolesPolicy";

        public const string NewsSettingsPolicy = "NewsSettingsPolicy";
        public const string PostArticlePolicy = "PostArticlePolicy";
        public const string ViewArticlePolicy = "ViewArticlePolicy";
        public const string ApproveArticlePolicy = "ApproveArticlePolicy";
    }



    /// <summary>
    /// Operation Policy to allow adding, viewing, updating and deleting general or specific user records.
    /// </summary>
    public static class AccountManagementOperations
    {
        public const string CreateOperationName = "Create";
        public const string ReadOperationName = "Read";
        public const string UpdateOperationName = "Update";
        public const string DeleteOperationName = "Delete";

        public static UserAccountAuthorizationRequirement Create = new UserAccountAuthorizationRequirement(CreateOperationName);
        public static UserAccountAuthorizationRequirement Read = new UserAccountAuthorizationRequirement(ReadOperationName);
        public static UserAccountAuthorizationRequirement Update = new UserAccountAuthorizationRequirement(UpdateOperationName);
        public static UserAccountAuthorizationRequirement Delete = new UserAccountAuthorizationRequirement(DeleteOperationName);
    }
}
