using System;
using System.Collections.Generic;
using System.Text;

namespace EzProcess.Core.Models.Interfaces
{
    public interface IBaseModel<KeyIdType> : IAuditableEntity
    {
        KeyIdType Id { get; set; }
    }
}
