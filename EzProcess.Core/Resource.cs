using System;
using System.Collections.Generic;
using System.Reflection;
using System.Resources;
using System.Text;

namespace EzProcess.Core
{
    public class Resource
    {
        static readonly Lazy<Resource> lazy = new Lazy<Resource>(() => new Resource());
        private ResourceManager rm;
       
        private Resource() {
            Assembly asm = Assembly.GetCallingAssembly();
            string rsFileName = asm.GetName().Name +  ".Resources.Messages";
            rm = new ResourceManager(rsFileName, asm);
        }

        public static Resource Instance => lazy.Value;

        public string GetString(string key)
        {
            return rm.GetString(key);
        }
    }
}
