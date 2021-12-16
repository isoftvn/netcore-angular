using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;
using System.Timers;

namespace EzProcess.Utils
{
    public class ByteArrayPool
    {
        static ByteArrayPool()
        {
            Instance = new ByteArrayPool();
        }

        public static ByteArrayPool Instance { get; }

        private ConcurrentStack<byte[]> _free = new ConcurrentStack<byte[]>();

        private Timer _sweeper;

        public int Free => _free.Count;

        public int MaxFree { get; private set; }

        public double MaxAllocated
        {
            get
            {
                return MaxFree * LeaseSize / (double)1024 / (double)1024;
            }
        }

        private ByteArrayPool()
        {
            for (int i = 0; i < SweepThreshold; i++)
            {
                _free.Push(new byte[LeaseSize]);
            }

            _sweeper = new Timer();

            _sweeper.AutoReset = false;
            _sweeper.Elapsed += Sweep;
            _sweeper.Interval = SweepInterval;
            _sweeper.Start();

            MaxFree = _free.Count;
        }

        public const int LeaseSize = 1024 * 64; // 64 kb

        private const int SweepThreshold = (16 * 1024 * 1024) / LeaseSize; // 16 MB worth of chunks, let this amount accumulate before releasing any array roots

        private const int SweepInterval = 1000 * 60 * 2; // 2 minutes

        private void Sweep(object sender, ElapsedEventArgs e)
        {
            MaxFree = Math.Max(_free.Count, MaxFree);

            while (_free.Count > SweepThreshold)
            {
                byte[] bytes;

                _free.TryPop(out bytes);
            }

            while (_free.Count < SweepThreshold)
            {
                _free.Push(new byte[LeaseSize]);
            }

            _sweeper.Start();
        }

        public byte[] Lease()
        {
            byte[] bytes;

            if (_free.Count > 0 && _free.TryPop(out bytes))
            {
                return bytes;
            }

            return new byte[LeaseSize];
        }

        public void Release(byte[] bytes) => _free.Push(bytes);
    }
}
