using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;

namespace EzProcess.Utils.Extensions
{
    public static class ObjectExt
    {
        public static bool ContainsProperty(this object instance, string propertyName, bool andWritable = false)
        {
            Object o = instance;
            PropertyInfo pi = null;

            //split the fields on . so we can deal with each level one at a time
            string[] testPropertNames = propertyName.Split('.');

            //process each level one at a time
            foreach (string propName in testPropertNames)
            {
                if (o == null)
                    break;
                //if this value is null, means either the object is null or the actual value is null, either way jump out of the loop

                pi = o.GetProperty(propName);
                if (pi == null) break;

                //get the actual value (value could be a list of objects, an object, or a property value)
                o = pi.GetValue(o, null);
            }

            return (pi != null && (pi.CanWrite || !andWritable));
        }

        public static object GetValueByNameRecursive(this object instance, string fieldName)
        {
            object o = instance;

            //split the fields on . so we can deal with each level one at a time
            string[] testFields = fieldName.Split('.');

            //process each level one at a time
            foreach (string fld in testFields)
            {
                //set this to a local variable so we can change it in the loop
                string fldName = fld;

                //get the ID if one exists
                string idString = fldName.GetBetweenText("[", "]");
                int? id = null;

                //strip the ID syntax if it exists and cast the ID to int
                if (!string.IsNullOrEmpty(idString))
                {
                    id = int.Parse(idString);
                    fldName = fldName.Replace("[" + id + "]", null);
                }

                //get the property for this level (could be a list if this is a 1 to many relationship)
                if (o == null)
                    return null;
                //if this value is null, means either the object is null or the actual value is null, either way jump out of the loop and return null

                PropertyInfo pi = o.GetProperty(fldName);

                if (pi != null)
                {
                    //get the actual value (value could be a list of objects, an object, or a property value)
                    o = pi.GetValue(o, null);
                }
            }

            return o;
        }

        public static object SetValueByNameRecursive(this object instance, string fieldName, string value)
        {
            object o = instance;

            //split the fields on . so we can deal with each level one at a time
            string[] testFields = fieldName.Split('.');

            //property info here because we need it at the end after the loop
            PropertyInfo pi = null;

            //save the last field in the list because within the loop we want to do something differently if we are the last one
            string lastField = testFields.Last();

            //process each level one at a time
            foreach (string fld in testFields)
            {
                //set this to a local variable so we can change it in the loop
                string fldName = fld;

                //get the ID if one exists
                string idString = fldName.GetBetweenText("[", "]");
                int? id = null;

                //strip the ID syntax if it exists and cast the ID
                if (!string.IsNullOrEmpty(idString))
                {
                    id = int.Parse(idString);
                    fldName = fldName.Replace("[" + id + "]", null);
                }

                //o could be null here, but we'll throw an exception which the calling module should catch and do something with
                pi = o.GetProperty(fldName);

                if (fld.Equals(lastField))
                    continue; //bail out if this is the last field, we don't actually want the value, just the pi

                if (pi != null)
                {
                    //get the actual value (value could be a list of objects, an object, or a property value)
                    o = pi.GetValue(o, null);
                }
            }

            //set the value if we have a valid property (we used the pi from the last loop, but the o from the previous one)
            if (pi == null) return value;
            Type piType = pi.PropertyType;

            object typedValue;

            //parse date times
            if (piType == typeof(DateTime?))
            {
                typedValue = (string.IsNullOrEmpty(value) ? null : (DateTime?)DateTime.Parse(value));
            }
            else if (piType == typeof(DateTime))
            {
                typedValue = DateTime.Parse(value);
            }
            else if (piType == typeof(DateTimeOffset?))
            {
                typedValue = (string.IsNullOrEmpty(value) ? null : (DateTimeOffset?)DateTimeOffset.Parse(value));
            }
            else if (piType == typeof(DateTimeOffset))
            {
                typedValue = DateTimeOffset.Parse(value);
            }
            else
            {
                //not a date type
                typedValue = value.ChangeType(piType);
            }

            pi.SetValue(o, typedValue, null);

            return value;
        }

        public static object ChangeType(this object value, Type conversionType)
        {
            if (conversionType == null)
            {
                throw new ArgumentNullException("conversionType");
            }

            if (conversionType.IsGenericType &&
                conversionType.GetGenericTypeDefinition() == typeof(Nullable<>))
            {
                if (value == null || (value is string && (string)value == string.Empty))
                {
                    return null;
                }
                NullableConverter nullableConverter = new NullableConverter(conversionType);
                conversionType = nullableConverter.UnderlyingType;
            }

            if (value is string)
            {
                if (conversionType == typeof(DateTimeOffset))
                {
                    return DateTimeOffset.Parse(value as string);
                }
                else if (conversionType == typeof(DateTime))
                {
                    return DateTime.Parse(value as string);
                }
            }

            return Convert.ChangeType(value, conversionType);
        }

        public static PropertyInfo GetProperty(this object instance, string property)
        {
            const BindingFlags flags = BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance;
            return instance.GetType().GetProperty(property, flags);
        }

        public static string GetPropertyByName(this object obj, string aName)
        {
            int dotIndex = aName.IndexOf('.');

            string strResult = string.Empty;
            if (dotIndex > -1)
            {
                string token = aName.Substring(0, dotIndex);
                int i = dotIndex + 1;
                string remainder = aName.Substring(i, aName.Length - i);
                PropertyInfo piSub = GetProperty(obj, token);

                if (piSub == null)
                    throw new Exception($"GetProperty failed - '{token}' not found");

                object subPropVal = piSub.GetValue(obj, null);
                if (subPropVal == null)
                    return null;

                strResult = GetPropertyByName(subPropVal, remainder);
            }
            else
            {
                PropertyInfo piResult = GetProperty(obj, aName);
                if (piResult == null)
                    throw new Exception($"GetProperty failed - '{aName}' not found");

                object oResult = piResult.GetValue(obj, null);
                if (oResult == null)
                    strResult = (piResult.PropertyType.IsValueType ? Activator.CreateInstance(piResult.PropertyType)?.ToString() : null);
                else
                    strResult = oResult.ToString();
            }

            return strResult;
        }

        public static object GetPropertyValue(this object source, string property)
        {
            if (source == null)
            {
                throw new ArgumentNullException(nameof(source));
            }
            if (string.IsNullOrWhiteSpace(property))
            {
                throw new ArgumentException("Invalid property name", nameof(property));
            }

            foreach (string part in property.Split('.'))
            {
                if (source == null)
                {
                    return null;
                }

                Type type = source.GetType();
                PropertyInfo info = type.GetProperty(part);

                if (info == null)
                {
                    throw new MissingMemberException(source.GetType().FullName, part);
                }

                source = info.GetValue(source, null);
            }

            return source;
        }
    }
}
