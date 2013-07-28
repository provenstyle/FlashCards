define(['durandal/plugins/router', 'durandal/app'], function (router, app) {

    return {
        router: router,        
        activate: function () {
            //Scroll ios to the header bar
            //setTimeout(function () { window.scrollTo(0, 1); }, 1000);
            
            return router.activate('library');
        }
    };
});