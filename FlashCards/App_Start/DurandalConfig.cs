using System;
using System.Web.Optimization;
using ProvenStyle.FlashCards.App_Start;

[assembly: WebActivator.PostApplicationStartMethod(
    typeof(DurandalConfig), "PreStart")]

namespace ProvenStyle.FlashCards.App_Start
{
    public static class DurandalConfig
    {
        public static void PreStart()
        {
            // Add your start logic here
            DurandalBundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}