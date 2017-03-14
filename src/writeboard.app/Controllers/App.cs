
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
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

        [HttpPost]
        protected IActionResult RegisterWriteBoard()
        {
            SqlConnection conn = new SqlConnection("Server=writeboard-db.database.windows.net;Database=writeboard;User Id=wbadmin;Password=neuedu#2017");
            conn.Open();

            SqlCommand cmd = new SqlCommand("INSERT INTO writeboards VALUES(@key, @email, @desc, NULL);", conn);
            cmd.ExecuteNonQuery();
            conn.Close();

            return View("Index");
        }
    }
}
