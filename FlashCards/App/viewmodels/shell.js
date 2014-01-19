define(['durandal/app', 'plugins/router'], function (app, router) {
    return {
        router: router,
        activate: function () {
            router.map([
                { route: ['catalog', '' ], title: 'Catalog', moduleId: 'viewmodels/catalog', nav: true },
                { route: 'about', title: 'About', moduleId: 'viewmodels/about', nav: true },
                { route: 'cards/:param1*details', title: 'Cards', moduleId: 'cards/index', hash:'#cards', nav: false }
               
            ]).buildNavigationModel();

            return router.activate();
        },
        randomChecked: false,
        randomChanged: function() {
           app.trigger('randomChanged', this.randomChecked);
           return true;
        }
    };
});