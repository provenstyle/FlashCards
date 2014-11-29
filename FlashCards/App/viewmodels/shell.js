define(['durandal/app', 'plugins/router'], function(app, router) {
   return {
      router: router,
      activate: function() {
         router.map([
            { route: ['catalog', ''], title: 'Catalog', moduleId: 'viewmodels/catalog', nav: true },
            { route: 'cards/:name/ids/(:id)', title: 'Cards', moduleId: 'viewmodels/cards', hash: '#cards', nav: false }               
         ]).buildNavigationModel();

         router.mapUnknownRoutes('viewmodels/catalog', "#catalog");

         return router.activate();
      }
   };
});