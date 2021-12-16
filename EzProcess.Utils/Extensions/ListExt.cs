using System;
using System.Collections.Generic;
using System.Text;

namespace EzProcess.Utils.Extensions
{
    public static class ListExt
    {
        public static void AddOrReplace<T, U>(this List<KeyValuePair<T, U>> list, KeyValuePair<T, U> item)
           where T : IEquatable<T>
        {
            int target_idx = list.FindIndex(n => n.Key.Equals(item.Key));
            if (target_idx != -1)
            {
                list[target_idx] = item;
            }
            else
            {
                list.Add(item);
            }
        }
    }
}
