using Microsoft.AspNetCore.Mvc;

namespace writeboard.app.Controllers
{
    public class App : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
