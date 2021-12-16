using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace EzProcess.Utils
{
    public class Encryption
    {/// <summary>
     ///     Compares two byte arrays in length-constant time. This comparison
     ///     method is used so that password hashes cannot be extracted from
     ///     on-line systems using a timing attack and then attacked off-line.
     /// </summary>
     /// <param name="a">The first byte array.</param>
     /// <param name="b">The second byte array.</param>
     /// <returns>True if both byte arrays are equal. False otherwise.</returns>
        private static bool SlowEquals(byte[] a, byte[] b)
        {
            uint diff = (uint)a.Length ^ (uint)b.Length;
            for (int i = 0; i < a.Length && i < b.Length; i++)
            {
                diff |= (uint)(a[i] ^ b[i]);
            }
            return diff == 0;
        }

        public static string GenerateHmacSha1Token(string input, byte[] salt)
        {
            HMACSHA1 hmacsha1 = new HMACSHA1(salt);
            byte[] byteArray = Encoding.ASCII.GetBytes(input);
            using (PooledMemoryStream stream = new PooledMemoryStream(byteArray))
            {
                return hmacsha1.ComputeHash(stream).Aggregate("", (s, e) => s + $"{e:x2}", s => s);
            }
        }

        public static byte[] Encrypt(byte[] bytesToBeEncrypted, byte[] passwordBytes)
        {
            byte[] encryptedBytes;
            byte[] saltBytes = passwordBytes;

            using (PooledMemoryStream ms = new PooledMemoryStream())
            {
                using (RijndaelManaged aes = new RijndaelManaged())
                {
                    aes.KeySize = 256;
                    aes.BlockSize = 128;

                    Rfc2898DeriveBytes key = new Rfc2898DeriveBytes(passwordBytes, saltBytes, 1000);
                    aes.Key = key.GetBytes(aes.KeySize / 8);
                    aes.IV = key.GetBytes(aes.BlockSize / 8);

                    aes.Mode = CipherMode.CBC;

                    using (CryptoStream cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(bytesToBeEncrypted, 0, bytesToBeEncrypted.Length);
                        cs.FlushFinalBlock();

                        encryptedBytes = ms.ToArray();
                    }
                }
            }

            return encryptedBytes;
        }

        public static byte[] Decrypt(byte[] bytesToBeDecrypted, byte[] passwordBytes)
        {
            byte[] decryptedBytes;
            byte[] saltBytes = passwordBytes;

            using (PooledMemoryStream ms = new PooledMemoryStream())
            {
                using (RijndaelManaged aes = new RijndaelManaged())
                {
                    aes.KeySize = 256;
                    aes.BlockSize = 128;

                    Rfc2898DeriveBytes key = new Rfc2898DeriveBytes(passwordBytes, saltBytes, 1000);
                    aes.Key = key.GetBytes(aes.KeySize / 8);
                    aes.IV = key.GetBytes(aes.BlockSize / 8);
                    aes.Padding = PaddingMode.PKCS7;

                    aes.Mode = CipherMode.CBC;

                    using (CryptoStream cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(bytesToBeDecrypted, 0, bytesToBeDecrypted.Length);
                        cs.FlushFinalBlock();

                        decryptedBytes = ms.ToArray();
                    }
                }
            }

            return decryptedBytes;
        }
    }
}
