using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProvenStyle.FlashCards.Controllers
{
   public class HomeController : Controller
   {
      public ActionResult Index()
      {         
         return View();
      }      
   }
}
