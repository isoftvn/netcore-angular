using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EzProcess.ViewModels
{
    public class UploadResultModel
    {
        public int Status { get; set; }
        public string Path { get; set; }
        public string Exception { get; set; }
    }

    public class UploadInputModel
    {
        public IFormFile Image { get; set; }
    }
}
