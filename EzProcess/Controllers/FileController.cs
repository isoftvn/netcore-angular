using EzProcess.Helpers;
using EzProcess.ViewModels;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace EzProcess.Controllers
{
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private IWebHostEnvironment _hostingEnvironment;

        public FileController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpPost("upload"), DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        [Authorize(Authorization.Policies.NewsSettingsPolicy)]
        public async Task<IActionResult> Upload([FromForm] UploadInputModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(Request.Headers["Referer"]) ||
                    new Uri(Request.Headers["Referer"]).AbsolutePath.StartsWith("/admin/news") == false)
                {
                    return BadRequest(new UploadResultModel { Status = 0 });
                }
                string today = DateTime.UtcNow.ToString("yyyyMMdd");
                string folderName = "Uploads\\" + today;
                string fileName = string.Empty;
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath, folderName);
                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                }
                if (model.Image.Length > 0)
                {
                    fileName = DateTime.UtcNow.Ticks.ToString() + "_" + ContentDispositionHeaderValue.Parse(model.Image.ContentDisposition).FileName.Trim('"');
                    string fullPath = Path.Combine(newPath, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await model.Image.CopyToAsync(stream);
                    }
                }
                return Ok(new UploadResultModel { Status = 1, Path = "/Uploads/" + today + "/" + fileName });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new UploadResultModel { Status = 0, Exception = ex.Message });
            }
        }
    }
}