using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace EzProcess.Utils
{
    public class PooledMemoryStream : Stream
    {
        private readonly IList<byte[]> _byteArrays = new List<byte[]>(24);

        private readonly ByteArrayPool _pool;

        private long _length = 0;

        private long _position = 0;

        public PooledMemoryStream(ByteArrayPool pool = null)
        {
            if (pool == null)
            {
                _pool = ByteArrayPool.Instance;
            }
            else
            {
                _pool = pool;
            }
        }

        public PooledMemoryStream(byte[] bytes, ByteArrayPool pool = null) : this(pool)
        {
            Write(bytes, 0, bytes.Length);

            Seek(0, SeekOrigin.Begin);
        }

        public PooledMemoryStream(Stream stream, ByteArrayPool pool = null) : this(pool)
        {
            stream.CopyTo(this, ByteArrayPool.LeaseSize);
        }

        public override bool CanRead => true;

        public override bool CanSeek => true;

        public override bool CanWrite => true;

        public override long Length => _length;

        public long Capacity => _byteArrays.Count * ByteArrayPool.LeaseSize;

        public override long Position
        {
            get
            {
                return _position;
            }
            set
            {
                _position = value;
            }
        }

        private byte[] GetSegment()
        {
            int index = FillSegments(_position);

            return _byteArrays[index];
        }

        private int FillSegments(long position)
        {
            int index = (int)(position / ByteArrayPool.LeaseSize);

            int count = index + 1;

            while (count > _byteArrays.Count)
            {
                _byteArrays.Add(_pool.Lease());
            }

            return index;
        }

        public byte[] ToArray() // provided for compatibility; try not to use
        {
            Seek(0, SeekOrigin.Begin);

            byte[] buffer = new byte[_length];

            long count = _length;

            int read = 0;

            while (count > 0)
            {
                read = Read(buffer, read, (int)_length);

                count -= read;
            }

            return buffer;
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            if (_position >= _length) return 0;

            int read = 0;

            while (count > 0)
            {
                int segmentOffset = (int)(_position % ByteArrayPool.LeaseSize);

                byte[] segment = GetSegment();

                while (segmentOffset < ByteArrayPool.LeaseSize)
                {
                    if (count <= 0 || offset >= buffer.Length || _position >= _length) return read;

                    int copyExtent = count;
                    if (copyExtent >= ByteArrayPool.LeaseSize) copyExtent = ByteArrayPool.LeaseSize;

                    if ((copyExtent + segmentOffset) > ByteArrayPool.LeaseSize) copyExtent = ByteArrayPool.LeaseSize - segmentOffset;
                    if (buffer.Length < copyExtent) copyExtent = buffer.Length;

                    int remainingChunk = (int)(_length - _position);
                    if (copyExtent >= remainingChunk) copyExtent = remainingChunk;

                    Buffer.BlockCopy(segment, segmentOffset, buffer, offset, copyExtent);

                    offset += copyExtent;
                    segmentOffset += copyExtent;
                    count -= copyExtent;
                    read += copyExtent;

                    _position += copyExtent;
                }
            }

            return read;
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            if (origin == SeekOrigin.Begin)
            {
                _position = 0;
            }
            else if (origin == SeekOrigin.End)
            {
                _position = _length;
            }

            _position += offset;

            if (_position > _length)
            {
                _position = _length;
            }
            else if (_position < 0)
            {
                _position = 0;
            }

            return _position;
        }

        public override void SetLength(long value)
        {
            FillSegments(value);

            if (_position > value)
            {
                _position = value;
            }

            _length = value;
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            while (count > 0)
            {
                int segmentOffset = (int)(_position % ByteArrayPool.LeaseSize);

                byte[] segment = GetSegment();

                while (count > 0 && offset < buffer.Length && segmentOffset < ByteArrayPool.LeaseSize)
                {
                    int copyExtent = count;
                    if (ByteArrayPool.LeaseSize < copyExtent) copyExtent = ByteArrayPool.LeaseSize;
                    if (buffer.Length < copyExtent) copyExtent = buffer.Length;
                    int remaining = ByteArrayPool.LeaseSize - segmentOffset;
                    if (remaining < copyExtent) copyExtent = remaining;

                    Buffer.BlockCopy(buffer, offset, segment, segmentOffset, copyExtent);

                    offset += copyExtent;
                    segmentOffset += copyExtent;
                    count -= copyExtent;

                    _position += copyExtent;

                    if (_position > _length) _length = _position;
                }
            }
        }

        public override void Flush() { }

        protected override void Dispose(bool disposing)
        {
            if (disposing) base.Dispose();

            GC.SuppressFinalize(this);
        }

        private bool _closed = false;

        public override void Close()
        {
            try
            {
                if (_closed) return;

                _closed = true;

                while (_byteArrays.Count > 0)
                {
                    int i = _byteArrays.Count - 1;

                    byte[] buffer = _byteArrays[i];

                    _pool.Release(buffer);

                    _byteArrays.RemoveAt(i);
                }

                _length = 0;

                _position = 0;
            }
            catch
            {
                // Nothing we can do here
            }
            finally
            {
                Dispose(false);
            }
        }

        ~PooledMemoryStream()
        {
            Close();
        }
    }
}
