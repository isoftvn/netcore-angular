﻿using System;
using System.Collections;

namespace EzProcess.Utils.Extensions
{
    public static class TypeExt
    {
        public static bool IsNonStringEnumerable(this Type type)
        {
            if (type == null || type == typeof(string))
            {
                return false;
            }
            return typeof(IEnumerable).IsAssignableFrom(type);
        }

        /// <summary>
        /// Determines if a type is an Entity Framework dynamic proxy type.
        /// </summary>
        /// <param name="type">The type to assess.</param>
        /// <returns>Whether the type is an Entity Framework dynamic proxy type.</returns>
        /// <remarks>
        /// This may change over time, but this gives us one place to check for an EF type.
        /// The current implementation only works for objects that are proxy generated by a DbContext.
        /// </remarks>
        public static bool IsEntityFrameworkDynamicProxy(this Type type)
        {
            return type.Namespace == "System.Data.Entity.DynamicProxies";
        }

        public static bool IsNumericType(this Type type)
        {
            return GetNumericTypeKind(type) != 0;
        }

        public static bool IsNullableType(this Type type)
        {
            return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        public static Type GetNonNullableType(this Type type)
        {
            return IsNullableType(type) ? type.GetGenericArguments()[0] : type;
        }

        public static bool IsSignedIntegralType(this Type type)
        {
            return GetNumericTypeKind(type) == 2;
        }

        public static bool IsUnsignedIntegralType(this Type type)
        {
            return GetNumericTypeKind(type) == 3;
        }

        public static int GetNumericTypeKind(this Type type)
        {
            type = GetNonNullableType(type);
            if (type.IsEnum) { return 0; }
            switch (Type.GetTypeCode(type))
            {
                case TypeCode.Char:
                case TypeCode.Single:
                case TypeCode.Double:
                case TypeCode.Decimal:
                    return 1;
                case TypeCode.SByte:
                case TypeCode.Int16:
                case TypeCode.Int32:
                case TypeCode.Int64:
                    return 2;
                case TypeCode.Byte:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                    return 3;
                default:
                    return 0;
            }
        }
    }
}
