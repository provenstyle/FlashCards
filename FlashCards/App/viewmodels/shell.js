define(['plugins/router'], function (router) {
    return {
        router: router,
        activate: function () {
            router.map([
                { route: ['catalog', '' ], title: 'Catalog', moduleId: 'viewmodels/catalog', nav: true },
                { route: 'about', title: 'About', moduleId: 'viewmodels/about', nav: false }
            ]).buildNavigationModel();

            return router.activate();
        }
    };
});