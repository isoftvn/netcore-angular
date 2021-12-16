using EzProcess.Core.Identity.Interfaces;
using EzProcess.Core.Models;
using EzProcess.Utils.Extensions;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EzProcess.Controllers
{
    public class BaseController : ControllerBase
    {
        private readonly IAccountManager _accountManager;
        public BaseController(IAccountManager accountManager)
        {
            _accountManager = accountManager;
        }
        protected void AddError(IEnumerable<string> errors, string key = "")
        {
            foreach (var error in errors)
            {
                AddError(error, key);
            }
        }
        protected void AddError(string error, string key = "")
        {
            ModelState.AddModelError(key, error);
        }
    }
}
