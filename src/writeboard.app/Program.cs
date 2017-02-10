using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace writeboard.app
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<WriteBoardApp>()
                .Build();

            host.Run();
        }
    }
}
