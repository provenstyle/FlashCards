using System;
using System.Web.Optimization;

namespace FlashCards
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.IgnoreList.Clear();
            AddDefaultIgnorePatterns(bundles.IgnoreList);

            bundles.Add(
             new ScriptBundle("~/Scripts/angular")

                .Include("~/Scripts/jquery-1.9.1.js")

                .Include("~/Scripts/angular.js")
                .Include("~/Scripts/angular-route.js")

                .Include("~/App/flashCardsModule.js")

                .Include("~/App/configs/routeConfig.js")

                .Include("~/App/models/cardFactory.js")
                .Include("~/App/models/selectedCards.js")

                .Include("~/App/mockData/angularMockData.js")
                .Include("~/App/mockData/multiplicationMockData.js")
                .Include("~/App/mockData/statesAndCapitalsMockData.js")
                .Include("~/App/services/flashCardService.js")

                .Include("~/App/controllers/catalogController.js")
                .Include("~/App/controllers/cardsController.js")

             );

            bundles.Add(
              new StyleBundle("~/Content/css")
                .Include("~/Content/bootstrap.min.css")
                .Include("~/Content/bootstrap-theme.min.css")
                .Include("~/Content/font-awesome.min.css")
                .Include("~/Content/durandal.css")
                .Include("~/Content/starterkit.css")
                .Include("~/Content/app.css")
                .Include("~/Content/flashcards.css")
              );
        }

        public static void AddDefaultIgnorePatterns(IgnoreList ignoreList)
        {
            if (ignoreList == null)
            {
                throw new ArgumentNullException("ignoreList");
            }

            ignoreList.Ignore("*.intellisense.js");
            ignoreList.Ignore("*-vsdoc.js");
            ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
            //ignoreList.Ignore("*.min.js", OptimizationMode.WhenDisabled);
            //ignoreList.Ignore("*.min.css", OptimizationMode.WhenDisabled);
        }
    }
}