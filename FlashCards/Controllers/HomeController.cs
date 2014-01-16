using System.Web.Mvc;

namespace FlashCards.Controllers
{
   public class HomeController : Controller
   {
      public ActionResult Index()
      {
         return View();
      }
   }
}
