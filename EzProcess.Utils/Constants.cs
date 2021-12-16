using System;
using System.Collections.Generic;
using System.Text;

namespace EzProcess.Utils
{
    public static class Constants
    {
        public const string CHANNEL_CAN_NOT_FIND_CHANNEL = "CHANNEL_CAN_NOT_FIND_CHANNEL";
        public const string CANNOT_BE_NULL = "CANNOT_BE_NULL";
        public const string CURRENT_PASSWORD_IS_REQUIRED = "CURRENT_PASSWORD_IS_REQUIRED";
        public const string USERNAME_AND_PASSWORD_COUPLE_INVALID = "USERNAME_AND_PASSWORD_COUPLE_INVALID";
        public const string ERR_WHEN_DELETE_ROLE = "ERR_WHEN_DELETE_ROLE";
        public const string ERR_WHEN_DELETE_USER = "ERR_WHEN_DELETE_USER";
        public const string ERR_WHEN_UNBLOCK_USER = "ERR_WHEN_UNBLOCK_USER";
        public const string ERR_WHEN_UPDATE_USER_PREF = "ERR_WHEN_UPDATE_USER_PREF";
        public const string CONFLICT_ROLE_ID_PARAM = "CONFLICT_ROLE_ID_PARAM";
        public const string ROLE_CAN_NOT_BE_DELETE = "ROLE_CAN_NOT_BE_DELETE";
        public const string CONTENT_CAN_NOT_FIND_CONTENT = "CONTENT_CAN_NOT_FIND_CONTENT";
        public const string CONTENT_CAN_NOT_EDIT_CONTENT = "CONTENT_CAN_NOT_EDIT_CONTENT";
        public const string ERR_CANNOT_DELETE_LAST_ADMIN = "ERR_CANNOT_DELETE_LAST_ADMIN";
        public const string ERR_CANNOT_EDIT_ADMIN_ACCOUNT = "ERR_CANNOT_EDIT_ADMIN_ACCOUNT";
        public const string ERR_CANNOT_DEACTIVE_LAST_ADMIN = "ERR_CANNOT_DEACTIVE_LAST_ADMIN";

        public const string ERR_WHEN_CREATE = "ERR_WHEN_CREATE";
        public const string ERR_WHEN_DELETE = "ERR_WHEN_DELETE";
        public const string ERR_WHEN_UPDATE = "ERR_WHEN_UPDATE";

        public static readonly string[] FalseStrings = { "0", "no", "false" };
        public static readonly string[] TrueStrings = { "1", "yes", "true" };
    }
}
