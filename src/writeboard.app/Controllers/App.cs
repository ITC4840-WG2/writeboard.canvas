using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;

namespace writeboard.app.Controllers
{
    public class App : Controller
    {
        [HttpGet("/{wbKey?}")]
        [HttpPost("/{wbKey?}")]
        public IActionResult Index(string wbKey)
        {
            string sqlCMD = "";
            using (SqlConnection conn = new SqlConnection("Server=writeboard-db.database.windows.net;Database=writeboard;User Id=wbadmin;Password=neuedu#2017"))
            {
                SqlCommand cmd = new SqlCommand("", conn);
                conn.Open();

                //process registration request
                if (wbKey == "register")
                {
                    string regKey = HttpContext.Request.Form["wb-key"];
                    string regDesc = HttpContext.Request.Form["wb-desc"];
                    string regEmail = HttpContext.Request.Form["wb-email"];
                    string regRes = HttpContext.Request.Form["wb-res"];

                    int regHeight, regWidth;
                    switch (regRes)
                    {
                        case "2160":
                            regWidth = 3840;
                            regHeight = 2160;
                            break;
                        case "1440":
                            regWidth = 2160;
                            regHeight = 1440;
                            break;
                        case "1080":
                            regWidth = 1920;
                            regHeight = 1080;
                            break;
                        case "720":
                            regWidth = 1280;
                            regHeight = 780;
                            break;
                        default:
                            regWidth = 1920;
                            regHeight = 1080;
                            break;
                    }

                    sqlCMD = "INSERT INTO writeboards VALUES('{0}', '{1}', '{2}', '', {3}, {4})";
                    sqlCMD = string.Format(sqlCMD, regKey, regEmail, regDesc, regWidth, regHeight);
                    cmd.CommandText = sqlCMD;
                    cmd.ExecuteNonQuery();

                    Response.Redirect("/" + regKey);
                }
                else if (wbKey == "save")
                {
                    //process state save request
                    string saveKey = HttpContext.Request.Form["wb-key"];
                    string saveState = HttpContext.Request.Form["wb-state"];

                    sqlCMD = "UPDATE writeboards SET WriteBoardState = '{0}' WHERE WriteBoardKey = '{1}'";
                    sqlCMD = string.Format(sqlCMD, saveState, saveKey);
                    cmd.CommandText = sqlCMD;
                    cmd.ExecuteNonQuery();
                }
                else
                {
                    //fetch writeboard by the provided key
                    sqlCMD = "SELECT WriteBoardState FROM writeboards WHERE WriteBoardKey = '{0}'";
                    sqlCMD = string.Format(sqlCMD, wbKey);
                    cmd.CommandText = sqlCMD;
                    string wbState = (string)cmd.ExecuteScalar();

                    //set viewbag values
                    ViewBag.wbKey = wbKey ?? "";
                    ViewBag.wbState = wbState ?? "";
                }                
            }

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
