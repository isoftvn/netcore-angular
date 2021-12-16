using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace EzProcess.Utils.Extensions
{
    public static class IEnumerableExt
    {
        public static IEnumerable<T> Add<T>(this IEnumerable<T> e, T value)
        {
            foreach (T item in e)
            {
                yield return item;
            }
            yield return value;
        }

        public static IEnumerable<T> Insert<T>(this IEnumerable<T> e, T value)
        {
            yield return value;
            foreach (T item in e)
            {
                yield return item;
            }
        }

        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> selector)
        {
            HashSet<TKey> keys = new HashSet<TKey>();
            foreach (TSource item in source)
            {
                if(keys.Add(selector(item))) {
                    yield return item;
                }
            }
        }

        public static IEnumerable<KeyValuePair<TKey, TElement>> ToKeyValuePairs<TSource, TKey, TElement>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector, Func<TSource, TElement> elementSelector)
        {
            return source.Select(i => new KeyValuePair<TKey, TElement>(keySelector(i), elementSelector(i)));
        }

        public static void Each<T>(this IEnumerable<T> enumerable, Action<T> action)
        {
            foreach (T obj in enumerable)
            {
                action(obj);
            }
        }

        public static T IndexOfOrDefault<T>(this IEnumerable<T> enumerable, int indexOf)
        {
            return IndexOfOrDefault(enumerable, indexOf, enumerable.Count());
        }

        public static T IndexOfOrDefault<T>(this IEnumerable<T> enumerable, int indexOf, int count)
        {
            if (count == 0) return default(T);
            if (count - 1 < indexOf) return default(T);

            int index = -1;

            IEnumerator<T> enumerator = enumerable.GetEnumerator();

            while (index < indexOf)
            {
                if (!enumerator.MoveNext()) return default(T);
                index++;
            }

            return enumerator.Current;
        }

        public static List<T> ToList<T>(this IEnumerable<T> enumerable, Func<T, bool> predicate)
        {
            return enumerable.Where(predicate).ToList();
        }

        public static List<N> ToList<T, N>(this IEnumerable<T> enumerable, Func<T, N> selector)
        {
            return enumerable.Select(selector).ToList();
        }

        public static bool SafeAny<T>(this IEnumerable<T> enumerable)
        {
            return enumerable?.Any() ?? false;
        }

        public static void AddNotEmpty(this IList<string> list, string item)
        {
            if (!item.IsEmpty()) list.Add(item);
        }

        public static Task ParallelForEachAsync<T>(this IEnumerable<T> source, Func<T, Task> body, CancellationToken cancellationToken = default(CancellationToken), int maxDegreeOfParallelism = -2, TaskScheduler scheduler = null)
        {
            if (maxDegreeOfParallelism == -2)
            {
                maxDegreeOfParallelism = Environment.ProcessorCount;
            }

            ExecutionDataflowBlockOptions options = new ExecutionDataflowBlockOptions
            {
                CancellationToken = cancellationToken,
                MaxDegreeOfParallelism = maxDegreeOfParallelism
            };

            if (scheduler != null)
            {
                options.TaskScheduler = scheduler;
            }

            ActionBlock<T> block = new ActionBlock<T>(body, options);

            foreach (T item in source)
            {
                block.Post(item);
            }

            block.Complete();

            return block.Completion;
        }
    }
}
