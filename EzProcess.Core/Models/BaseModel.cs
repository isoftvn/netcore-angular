using EzProcess.Core.Models.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EzProcess.Core.Models
{
    public class BaseModel<KeyIdType> : IBaseModel<KeyIdType>
    {
        public BaseModel()
        {
            UpdatedDate = DateTime.Now;
            CreatedDate = DateTime.Now;
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public KeyIdType Id { get; set; }
        [MaxLength(64)]
        public string CreatedBy { get; set; }
        [MaxLength(64)]
        public string UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
