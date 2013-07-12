define(['durandal/plugins/router', 'durandal/app'], function (router, app) {

    return {
        router: router,
        search: function() {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },
        activate: function () {
            //Scroll ios to the header bar
            setTimeout(function () { window.scrollTo(0, 1); }, 1000);
            
            return router.activate('library');
        }
    };
});