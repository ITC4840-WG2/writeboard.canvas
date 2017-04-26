using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

using MimeKit;
using MailKit.Net.Smtp;

namespace writeboard.app.Controllers
{
    public class App : Controller
    {
        [HttpGet("/{wbKey?}")]
        [HttpPost("/{wbKey?}")]
        public IActionResult Index(string wbKey)
        {
            //get current url, set app url
            string currentURL = getCurrentURL(HttpContext);
            if (currentURL == "http://writeboard.net")
            {
                ViewBag.appURL = "http://app.writeboard.net";
            }
            else
            {
                ViewBag.appURL = "http://writeboard-app-tst.azurewebsites.net";
            }

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

                    //send successful registration email
                    var message = new MimeMessage();
                    message.From.Add(new MailboxAddress("writeboard-team", "writeboard-team@outlook.com"));
                    message.To.Add(new MailboxAddress(regEmail, regEmail));
                    message.Subject = "WriteBoard - New Registration";
                    var bodyBuilder = new BodyBuilder();
                    bodyBuilder.HtmlBody = @"<h4>Your WriteBoard is available here: <a href='" + ViewBag.appURL + "/" + regKey + "'>" + ViewBag.appURL + "/" + regKey + "</h4>";
                    message.Body = bodyBuilder.ToMessageBody();o

                    using (var client = new SmtpClient())
                    {
                        client.Connect("smtp.live.com", 587, false);
                        client.AuthenticationMechanisms.Remove("XOAUTH2");
                        client.Authenticate("writeboard-team@outlook.com", "neuedu#2017");
                        client.Send(message);
                        client.Disconnect(true);
                    }

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
                    sqlCMD = "SELECT TOP 1 * FROM writeboards WHERE WriteBoardKey = '{0}'";
                    sqlCMD = string.Format(sqlCMD, wbKey);
                    cmd.CommandText = sqlCMD;
                    var wbInfo = cmd.ExecuteReader();

                    if (wbInfo.HasRows)
                    {
                        wbInfo.Read();

                        //set viewbag values
                        ViewBag.wbKey = wbInfo["WriteBoardKey"] ?? "";
                        ViewBag.wbState = wbInfo["WriteBoardState"] ?? "";
                        ViewBag.wbWidth = wbInfo["WriteBoardWidth"] ?? "";
                        ViewBag.wbHeight = wbInfo["WriteBoardHeight"] ?? "";
                    }
                    else
                    {
                        //set viewbag defaults
                        ViewBag.wbKey = "";
                        ViewBag.wbState = "";
                        ViewBag.wbWidth = 1920;
                        ViewBag.wbHeight = 1080;
                    }
                }                
            }

            return View();
        }
        
        public string getCurrentURL(HttpContext context)
        {
            return $"{context.Request.Scheme}://{context.Request.Host}";
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
