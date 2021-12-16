using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace EzProcess.Utils.Extensions
{
    public static class StringExt
    {
        private static readonly Regex WithoutReplacementPlaceholders = new Regex(@"\{(?<variablePrefix>[\$\%]{1})(?<fieldName>[\w\.\>]+?)\}", RegexOptions.Compiled);
        private static readonly Regex WithReplacementPlaceholders = new Regex(@"\{(?<variablePrefix>[\$\%\#]{1})(?<fieldName>[\w\.\>]+?)\}", RegexOptions.Compiled);
        private static readonly Regex FuncCallPattern = new Regex(@"[\%]{1}(?<funcSig>(?<funcName>\w+)\((?<funcArgs>.*?)\))", RegexOptions.Compiled);
        private static readonly Regex FuncArgsPattern = new Regex(@"\(\s*(?<funcArgs>.+?)\s*\)", RegexOptions.Compiled);
        private static readonly Regex WithRepeatTemplatePartHolder = new Regex(@"(?<variablePrefix>[\$\%]{1})(?<fieldName>[\w]+\[[0-9]+\]>[\w]+)", RegexOptions.Compiled);
        private static readonly char[] Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".ToCharArray();

        public static string GenerateSlug(this string phrase)
        {
            string str = phrase.RemoveAccent().ToLower();
            // invalid chars           
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            // convert multiple spaces into one space   
            str = Regex.Replace(str, @"\s+", " ").Trim();
            // cut and trim 
            str = str.Substring(0, str.Length <= 45 ? str.Length : 45).Trim();
            str = Regex.Replace(str, @"\s", "-"); // hyphens   
            return str;
        }

        public static string RemoveAccent(this string txt)
        {
            byte[] bytes = System.Text.Encoding.GetEncoding("Cyrillic").GetBytes(txt);
            return System.Text.Encoding.ASCII.GetString(bytes);
        }
        /// <summary>
        ///     Converts a string to an enum
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="enumString">The enum string.</param>
        /// <returns></returns>
        public static T ToEnum<T>(this string enumString)
        {
            return (T)Enum.Parse(typeof(T), enumString);
        }

        public static string NullIfBlank(this string value)
        {
            return string.IsNullOrEmpty(value) ? null : value;
        }

        public static string ToSingleLine(this string value, string lineSeparator = null)
        {
            return Regex.Replace(value, @"\r\n?|\n", lineSeparator);
        }

        public static bool SurroundedWith(this string value, char char1, char char2)
        {
            return SurroundedWith(value, char1.ToString(), char2.ToString());
        }

        public static bool SurroundedWith(this string value, string string1, string string2)
        {
            return SurroundedWith(value, string1, string2, StringComparison.CurrentCulture);
        }

        public static bool SurroundedWith(this string value, string string1, string string2, StringComparison comparison)
        {
            return (value?.StartsWith(string1, comparison) ?? false) && (value?.EndsWith(string2, comparison) ?? false);
        }

        public static string TrimToNull(this string value)
        {
            if (value == null) return null;
            value = value.Trim();
            return value == string.Empty ? null : value;
        }

        public static DateTime? ToDateTimeOrNull(this string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            DateTime dt;
            if (DateTime.TryParse(value, out dt))
            {
                return dt;
            }

            return null;
        }

        public static long? ToLongOrNull(this string value)
        {
            long tryLong;
            return long.TryParse(value, out tryLong) ? (long?)tryLong : null;
        }

        public static int? ToIntOrNull(this string value)
        {
            int tryInt;
            return int.TryParse(value, out tryInt) ? (int?)tryInt : null;
        }

        public static int? ToIntOrNullIfZero(this string value)
        {
            int tryInt;
            if (int.TryParse(value, out tryInt))
            {
                if (tryInt == 0)
                {
                    return null;
                }
                else
                {
                    return tryInt;
                }
            }
            return null;
        }

        public static byte? ToByteOrNull(this string value)
        {
            byte tryByte;
            return byte.TryParse(value, out tryByte) ? (byte?)tryByte : null;
        }

        public static int ToIntOrZero(this string value)
        {
            int i;
            return int.TryParse(value, out i) ? i : 0;
        }

        public static int ToInt(this string value)
        {
            return int.Parse(value);
        }

        public static int ToIntOrDefault(this string value, int defaultValue = 0)
        {
            int? i = value.ToIntOrNull();
            if (!i.HasValue) return defaultValue;
            return i.Value;
        }

        public static long ToLongOrDefault(this string value, int defaultValue = 0)
        {
            long l;
            if (long.TryParse(value, out l))
            {
                return l;
            }
            return 0;
        }

        public static double ToDoubleOrZero(this string value)
        {
            double d;
            return double.TryParse(value, out d) ? d : 0D;
        }

        public static double? ToDoubleOrNull(this string value)
        {
            double d;
            return double.TryParse(value, out d) ? (double?)d : null;
        }

        public static decimal? ToDecimalOrNull(this string value)
        {
            decimal d;
            return decimal.TryParse(value, out d) ? (decimal?)d : null;
        }

        public static string Unquotify(string parameter)
        {
            return parameter.Replace("\"", "").Replace("\\", "").Trim();
        }

        public static string ToCommaSeparatedList(this IList<string> list, bool separateLastValueWithAnd = false)
        {
            int count = list.Count;

            if (count == 0)
            {
                return string.Empty;
            }

            if (count == 1)
            {
                return list[0];
            }

            StringBuilder result = new StringBuilder(200);

            if (count == 2)
            {
                result.Append(list[0]);
                if (separateLastValueWithAnd)
                {
                    result.Append(" and ");
                }
                else
                {
                    result.Append(", ");
                }

                result.Append(list[1]);

                return result.ToString();
            }

            for (int i = 0; i < count - 1; i++)
            {
                result.Append(list[i] + ", ");
            }

            if (separateLastValueWithAnd)
            {
                result.Append("and ");
            }

            result.Append(list[count - 1]);

            return result.ToString();
        }

        /// <summary>
        ///     Remove HTML tags from string using char array.  Faster than regexp
        /// </summary>
        public static string StripHTMLTags(this string source)
        {
            char[] array = new char[source.Length];
            int arrayIndex = 0;
            bool inside = false;

            foreach (char @let in source)
            {
                if (@let == '<')
                {
                    inside = true;
                    continue;
                }
                if (@let == '>')
                {
                    inside = false;
                    continue;
                }
                if (inside)
                {
                    continue;
                }

                array[arrayIndex] = @let;
                arrayIndex++;
            }
            return new string(array, 0, arrayIndex);
        }

        /// <summary>
        ///     Determines whether the string meets the criteria of a strong password. Strong passwords must be at least 8
        ///     characters, contain at least one lowercase char, one upperchase char and one digit.
        /// </summary>
        /// <param name="password">The string to evaluate.</param>
        /// <returns>
        ///     <c>true</c> if the string is a strong password; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsValidPassword(this string password)
        {
            return new Regex(@"^(?=^.{8,}$)((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.*$").IsMatch(password.Trim());
        }

        /// <summary>
        ///     Determines whether the string is a date.
        /// </summary>
        /// <returns>
        ///     <c>true</c> if the string is a date; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsDate(this string input)
        {
            DateTimeOffset date;
            return DateTimeOffset.TryParse(input, out date);
        }

        public static DateTimeOffset? ToDateTimeOffset(this string input)
        {
            DateTimeOffset date;
            if (DateTimeOffset.TryParse(input, out date))
            {
                return date;
            }
            return null;
        }

        public static bool IsNumeric(this string input)
        {
            double value;
            return double.TryParse(input, out value);
        }

        /// <summary>
        ///     Returns the truncated string if more than the maximum characters (appends ...).
        /// </summary>
        /// <param name="fulltext">The fulltext.</param>
        /// <param name="maxLength">Length of the max.</param>
        /// <returns></returns>
        public static string ToMaximumLength(this string fulltext, int maxLength)
        {
            return fulltext.ToMaximumLength(maxLength, "...");
        }

        /// <summary>
        ///     Returns the truncated string if more than the maximum characters.
        /// </summary>
        /// <param name="fulltext">The fulltext.</param>
        /// <param name="maxLength">Length of the max.</param>
        /// <param name="truncatedEnding">The truncated ending.</param>
        /// <returns></returns>
        public static string ToMaximumLength(this string fulltext, int maxLength, string truncatedEnding)
        {
            string result = fulltext;
            if (!string.IsNullOrEmpty(fulltext) && fulltext.Length > maxLength && fulltext.Length > truncatedEnding.Length)
            {
                result = fulltext.Substring(0, maxLength - truncatedEnding.Length) + truncatedEnding;
            }

            return result;
        }

        /// <summary>
        ///     Converts the string to valid Javascript
        /// </summary>
        /// <param name="s">The string to convert</param>
        /// <returns>The string, converted to Javascript friendly format.</returns>
        public static string ToJavaScript(this string s)
        {
            if (string.IsNullOrEmpty(s))
            {
                return s;
            }

            StringBuilder sb = new StringBuilder();
            foreach (char c in s)
            {
                switch (c)
                {
                    case '\'':
                        sb.Append("\\\'");
                        break;
                    case '\"':
                        sb.Append("\\\"");
                        break;
                    case '\\':
                        sb.Append("\\\\");
                        break;
                    case '\b':
                        sb.Append("\\b");
                        break;
                    case '\f':
                        sb.Append("\\f");
                        break;
                    case '\n':
                        sb.Append("\\n");
                        break;
                    case '\r':
                        sb.Append("\\r");
                        break;
                    case '\t':
                        sb.Append("\\t");
                        break;
                    default:
                        int i = c;
                        if (i < 32 || i > 127)
                        {
                            sb.AppendFormat("\\u{0:X04}", i);
                        }
                        else
                        {
                            sb.Append(c);
                        }
                        break;
                }
            }

            return sb.ToString();
        }

        public static bool Contains(this string source, string toCheck, StringComparison comp)
        {
            if (source == null)
            {
                throw new ArgumentNullException("Source");
            }

            return source.IndexOf(toCheck, comp) >= 0;
        }

        public static string InBetween(this string source, string begintag, string endtag)
        {
            return InBetween(source, begintag, endtag, false);
        }

        public static string InBetween(this string source, string begintag, string endtag, bool includeTags)
        {
            return InBetween(source, begintag, endtag, includeTags, false);
        }

        public static string InBetween(this string source, string begintag, string endtag, bool includetags, bool searchFromEnd)
        {
            string output = string.Empty;
            int beginoffset = begintag.Length;
            int endoffset = -endtag.Length;
            int beginpos = source.IndexOf(begintag, StringComparison.CurrentCultureIgnoreCase);
            int endpos;

            if (searchFromEnd)
            {
                endpos = source.LastIndexOf(endtag, source.Length, StringComparison.CurrentCultureIgnoreCase);
            }
            else
            {
                endpos = source.IndexOf(endtag, beginpos + begintag.Length, StringComparison.CurrentCultureIgnoreCase);
            }

            if (source.Length > 0 && beginpos >= 0 && endpos >= 0)
            {
                if (includetags)
                {
                    beginoffset = 0;
                    endoffset = endtag.Length;
                }

                output = source.Substring(beginpos + beginoffset, endpos - beginpos + endoffset);
            }

            return output;
        }

        public static string Replace(this string s, IDictionary<string, string> dictionary)
        {
            if (string.IsNullOrEmpty(s)) return s;

            if (!dictionary.SafeAny()) return s;

            StringBuilder buffer = new StringBuilder(s);

            foreach (KeyValuePair<string, string> kvp in dictionary)
            {
                buffer.Replace(kvp.Key, kvp.Value);
            }

            string result = buffer.ToString();

            return result;
        }

        public static string ReplaceToStar(this string s)
        {
            if (string.IsNullOrWhiteSpace(s))
                return string.Empty;
            return new string('*', s.Length);
        }

        public static string ReplaceKvpStack(this string s, Stack<KeyValuePair<string, string>> stack, int capacity, IEnumerable<char> trailing = null)
        {
            if (s.IsEmpty()) return s;

            if (stack?.Count == 0) return s;

            StringBuilder buffer = new StringBuilder(s, capacity); // assumes we know exactly how long

            int startIndex = s.Length - 1; // eos

            while (stack.Count > 0)
            {
                KeyValuePair<string, string> kvp = stack.Pop();

                startIndex = s.LastIndexOf(kvp.Key, startIndex);

                if (startIndex <= -1)
                {
                    startIndex = s.Length - 1;

                    continue;
                }

                buffer.Remove(startIndex, kvp.Key.Length);

                buffer.Insert(startIndex, kvp.Value);
            }

            if (trailing != null)
            {
                foreach (char c in trailing) buffer.Append(c);
            }

            string result = buffer.ToString();

            return result;
        }

        public static string Replace(this string str, string oldValue, string newValue, StringComparison comparison)
        {
            StringBuilder sb = new StringBuilder();

            int previousIndex = 0;
            int index = str.IndexOf(oldValue, comparison);
            while (index != -1)
            {
                sb.Append(str.Substring(previousIndex, index - previousIndex));
                sb.Append(newValue);
                index += oldValue.Length;

                previousIndex = index;
                index = str.IndexOf(oldValue, index, comparison);
            }
            sb.Append(str.Substring(previousIndex));

            return sb.ToString();
        }

        public static string ConvertCRLFtoBR(this string s)
        {
            return s.Replace(Environment.NewLine, "<br/>");
        }

        public static string ConvertSQLNewLinetoBR(this string s)
        {
            return s.Replace("/n", "<br/>");
        }

        public static string AppendIfNotNullOrEmpty(this string s, string append)
        {
            return string.IsNullOrEmpty(s) ? s : s + append;
        }

        public static string GetBetweenText(this string sBuffer, string sStartText, string sEndText, StringComparison comparison = StringComparison.Ordinal)
        {
            return sBuffer.GetBetweenText(0, sStartText, sEndText, comparison);
        }

        public static string GetBetweenText(this string buffer, int startIndex, string startText, string endText, StringComparison comparison = StringComparison.Ordinal)
        {
            int startTextIndex = buffer.IndexOf(startText, startIndex, comparison);

            if (startTextIndex > -1)
            {
                int endTextIndex = buffer.IndexOf(endText, startTextIndex, comparison);

                if (endTextIndex > -1)
                {
                    return buffer.Substring(startTextIndex + startText.Length, endTextIndex - (startTextIndex + startText.Length));
                }
            }

            return string.Empty;
        }

        public static string Encrypt(this string input, string password)
        {
            byte[] bytesToBeEncrypted = Encoding.UTF8.GetBytes(input);
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

            passwordBytes = SHA256.Create().ComputeHash(passwordBytes);

            byte[] bytesEncrypted = Encryption.Encrypt(bytesToBeEncrypted, passwordBytes);

            string result = Convert.ToBase64String(bytesEncrypted);

            return result;
        }

        public static string Decrypt(this string input, string password)
        {
            if (string.IsNullOrEmpty(input)) return input;

            string result = "";
            try
            {
                byte[] bytesToBeDecrypted = Convert.FromBase64String(input);
                byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
                passwordBytes = SHA256.Create().ComputeHash(passwordBytes);
                byte[] bytesDecrypted = Encryption.Decrypt(bytesToBeDecrypted, passwordBytes);
                result = Encoding.UTF8.GetString(bytesDecrypted);
            }
            catch
            {
                // ignored
            }
            return result;
        }


        public static SecureString ToSecure(this string source)
        {
            if (source == null)
            {
                throw new ArgumentNullException(nameof(source));
            }

            SecureString ss = new SecureString();
            foreach (char c in source)
            {
                ss.AppendChar(c);
            }

            return ss;
        }

        // Every time this function is used, a sad face is made somewhere.
        public static string ToUnsecure(this SecureString input)
        {
            if (input == null)
                throw new ArgumentNullException(nameof(input));

            IntPtr unmanagedString = IntPtr.Zero;
            try
            {
                unmanagedString = Marshal.SecureStringToGlobalAllocUnicode(input);
                return Marshal.PtrToStringUni(unmanagedString);
            }
            finally
            {
                Marshal.ZeroFreeGlobalAllocUnicode(unmanagedString);
            }
        }

        public static string GetMd5Hash(this string sourceString)
        {
            MD5 md5Hash = MD5.Create();
            // Convert the input string to a byte array and compute the hash. 
            byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(sourceString ?? string.Empty));

            // Create a new Stringbuilder to collect the bytes 
            // and create a string.
            StringBuilder sBuilder = new StringBuilder();

            // Loop through each byte of the hashed data  
            // and format each one as a hexadecimal string. 
            foreach (byte t in data)
            {
                sBuilder.Append(t.ToString("x2"));
            }
            // Return the hexadecimal string. 
            return sBuilder.ToString();
        }

        public static string RemoveNonPrintables(this string sourceString)
        {
            StringBuilder sb = new StringBuilder(sourceString.Length);

            // Removing generally unsupported UTF-8 characters except for specific Word characters allowed to pass through

            foreach (char c in sourceString)
            {
                if ((c == 9) ||             // tab
                    (c == 10) ||            // cr
                    (c == 13) ||            // lf                    
                    (c > 31 && c < 127) ||  // English letters
                    (c > 159 && c < 880) || // other language printables (Spanish, German, Turkish, etc)
                    (c == 8221) ||          // right double quote
                    (c == 8220) ||          // left double quote
                    (c == 8216) ||          // left single quote
                    (c == 8217) ||          // right single quote
                    (c == 8226))            // bullet
                {
                    sb.Append(c);
                }
            }

            return sb.ToString();
        }

        public static string ToFileNameSafe(this string s, bool allowSpace)
        {
            const string replacement = "";

            Dictionary<string, string> badchars = new Dictionary<string, string>
            {
                {"<", replacement},
                {">", replacement},
                {":", replacement},
                {"\"", replacement},
                {"/", replacement},
                {"\\", replacement},
                {"|", replacement},
                {"?", replacement},
                {",", replacement},
                {"'", replacement},
                {"*", replacement},
                {"&", replacement},
                {"\r\n", replacement},
                {"\n", replacement},
                {"\r", replacement}
            };

            if (!allowSpace)
            {
                badchars.Add(" ", "_");
            }

            return s.RemoveNonPrintables().StripHTMLTags().Replace(badchars);
        }

        public static string StripTags(string html)
        {
            return Regex.Replace(html, "<.*?>", "");
        }

        /// <summary>
        ///     Removes the PK tags from 1 to many review properties such as
        ///     Review_Assignment[78969].Reviewer_TimeLog[78798].TimeSpent
        /// </summary>
        public static string StripIDTags(this string source)
        {
            //doing it as an array for performance purposes (faster than RegEx and we run this on every business rule)
            int length = source.Length;
            char[] array = new char[source.Length];
            int outputArrayIndex = 0;

            for (int i = 0; i < length; i++)
            {
                char @let = source[i];
                switch (@let)
                {
                    case '[':
                    case ']':
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        continue;
                }

                array[outputArrayIndex] = @let;
                outputArrayIndex++;
            }

            return new string(array, 0, outputArrayIndex);
        }

        public static string NumbersOnly(this string source)
        {
            if (string.IsNullOrEmpty(source))
                return source;

            StringBuilder sb = new StringBuilder();
            foreach (char c in source)
            {
                if (char.IsNumber(c))
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }

        /// <summary>
        /// This is a simple implementation of CamelCase (not complete).
        /// For example, camel casing the word "camelcase" will yield "Camelcase" and not the expected "CamelCase".
        /// </summary>
        /// <param name="source">The string to camel case.</param>
        /// <returns>The camel cased string.</returns>
        public static string ToCamelCase(this string source)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (source.Length == 1)
            {
                return char.ToUpper(source[0]).ToString();
            }
            else
            {
                return char.ToUpper(source[0]) + source.Substring(1).ToLower();
            }
        }

        public static bool ToBoolean(this string s, bool defaultValue = false)
        {
            if (s.IsEmpty()) return defaultValue;

            string v = s.ToLower().Trim();
            if (Constants.TrueStrings.Contains(v)) return true;
            if (Constants.FalseStrings.Contains(v)) return false;

            return defaultValue;
        }

        public static bool? ToBooleanOrNull(this string s)
        {
            if (s.IsEmpty()) return null;

            string v = s.ToLower().Trim();
            if (Constants.TrueStrings.Contains(v)) return true;
            if (Constants.FalseStrings.Contains(v)) return false;

            return null;
        }

        public static bool AnyEmpty(params string[] strings)
        {
            foreach (string s in strings)
            {
                if (string.IsNullOrWhiteSpace(s)) return true;
            }

            return false;
        }

        public static bool AllEmpty(params string[] strings)
        {
            foreach (string s in strings)
            {
                if (!string.IsNullOrWhiteSpace(s)) return false;
            }

            return true;
        }

        public static string FromLeft(this string source, int len)
        {
            if (source.Length <= len) return source;

            IEnumerable<char> chars = source.Take(len);

            return new string(chars.ToArray());
        }

        public static string FromRight(this string source, int len)
        {
            if (source.Length <= len) return source;

            IEnumerable<char> chars = source.Skip(source.Length - len).Take(len);

            return new string(chars.ToArray());
        }

        public static bool IsEmpty(this string s)
        {
            return string.IsNullOrWhiteSpace(s);
        }

        public static string SafeTrim(this string s, string def = "")
        {
            return !s.IsEmpty() ? s.Trim() : def;
        }

        public static string SafeTrimEnd(this string s, string def = "")
        {
            return !s.IsEmpty() ? s.TrimEnd() : def;
        }

        public static string Coalesce(params string[] strings)
        {
            foreach (string s in strings)
            {
                if (!s.IsEmpty()) return s;
            }

            return string.Empty;
        }

        public static string Squash(this IEnumerable<string> strings, string separator = "")
        {
            return string.Join(separator, strings);
        }

        public static string ReplaceFirst(this string text, string search, string replace, int startIndex = 0)
        {
            if (startIndex > 0)
            {
                string left = text.Substring(0, startIndex);

                string right = text.Substring(startIndex + search.Length);

                return left + replace + right;
            }
            else
            {
                int first = text.IndexOf(search);

                if (first < 0)
                {
                    return text;
                }

                return text.Substring(0, first) + replace + text.Substring(first + search.Length);
            }
        }

        public static IEnumerable<string> SplitWithoutEmptyValues(this string source, params char[] separators)
        {
            if (!separators.SafeAny())
            {
                separators = new char[] { ',' };
            }

            return source?.TrimToNull()?
                .Split(separators)
                .Select(rt => rt.Trim())
                .Where(rt => !rt.IsEmpty()) ?? Enumerable.Empty<string>();
        }

        public static IEnumerable<string> SplitReverse(this string source, char[] chars, int count, StringSplitOptions options)
        {
            if (source == null)
            {
                throw new ArgumentNullException(nameof(source));
            }
            if (chars == null)
            {
                throw new ArgumentNullException(nameof(chars));
            }
            if (count < 1)
            {
                throw new ArgumentOutOfRangeException(nameof(count));
            }

            StringBuilder sb = new StringBuilder();

            int cnt = 0;
            int splits = 0;
            for (cnt = source.Length - 1; cnt >= 0; cnt--)
            {
                if (splits == (count - 1))
                {
                    break;
                }

                if (!chars.Contains(source[cnt]))
                {
                    sb.Insert(0, source[cnt]);
                }
                else
                {
                    switch (options)
                    {
                        case StringSplitOptions.None:
                            yield return sb.ToString();
                            splits++;
                            sb.Length = 0;
                            break;

                        case StringSplitOptions.RemoveEmptyEntries:
                            if (sb.Length > 0)
                            {
                                yield return sb.ToString();
                                splits++;
                            }
                            sb.Length = 0;
                            break;
                    }
                }
            }

            if (sb.Length > 0)
            {
                yield return sb.ToString();
            }

            if (cnt > 0)
            {
                yield return source.Substring(0, cnt + 1);
            }

            yield break;
        }

        public static bool EqualsIgnoreCase(this string s, string v)
        {
            return s.Equals(v, StringComparison.InvariantCultureIgnoreCase);
        }

        public static bool IsUri(this string source)
        {
            Uri uri;
            return Uri.TryCreate(source, UriKind.Absolute, out uri) && uri.Scheme == Uri.UriSchemeHttp;
        }

        public static string TrimEnd(this string text, string removeText)
        {
            if (text == null || removeText == null)
                return text;

            while (text.EndsWith(removeText))
            {
                text = text.Substring(0, text.Length - removeText.Length);
            }

            return text;
        }

        public static string ToBase32Encode(this string text)
        {
            byte[] data = Encoding.UTF8.GetBytes(text);

            int inByteSize = 8;
            int outByteSize = 5;

            int i = 0, index = 0, digit = 0;
            int current_byte, next_byte;
            StringBuilder result = new StringBuilder((data.Length + 7) * inByteSize / outByteSize);

            while (i < data.Length)
            {
                current_byte = (data[i] >= 0) ? data[i] : (data[i] + 256); // Unsign

                /* Is the current digit going to span a byte boundary? */
                if (index > (inByteSize - outByteSize))
                {
                    if ((i + 1) < data.Length)
                        next_byte = (data[i + 1] >= 0) ? data[i + 1] : (data[i + 1] + 256);
                    else
                        next_byte = 0;

                    digit = current_byte & (0xFF >> index);
                    index = (index + outByteSize) % inByteSize;
                    digit <<= index;
                    digit |= next_byte >> (inByteSize - index);
                    i++;
                }
                else
                {
                    digit = (current_byte >> (inByteSize - (index + outByteSize))) & 0x1F;
                    index = (index + outByteSize) % inByteSize;
                    if (index == 0)
                        i++;
                }
                result.Append(Alphabet[digit]);
            }

            return result.ToString();
        }

        public static string AddSpaceBeforeUpperCase(this string originalValue, bool preserveAcronyms = true)
        {
            if (string.IsNullOrWhiteSpace(originalValue))
                return string.Empty;
            StringBuilder newText = new StringBuilder(originalValue.Length * 2);
            newText.Append(originalValue[0]);
            for (int i = 1; i < originalValue.Length; i++)
            {
                if (char.IsUpper(originalValue[i]))
                    if ((originalValue[i - 1] != ' ' && !char.IsUpper(originalValue[i - 1])) ||
                        (preserveAcronyms && char.IsUpper(originalValue[i - 1]) &&
                         i < originalValue.Length - 1 && !char.IsUpper(originalValue[i + 1])))
                        newText.Append(' ');
                newText.Append(originalValue[i]);
            }
            return newText.ToString();
        }
    }
}
