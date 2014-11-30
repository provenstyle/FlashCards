(function () {

    angular
        .module('flashCards')
        .config(routeConfig);


    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'App/views/catalog.html',
                controller: 'catalogController'
            })

            .when('/cards/:name/ids/:id', {
                templateUrl: 'App/views/cards.html',
                controller: 'cardsController'
            })

            .otherwise({
                redirectTo: '/'
            });
    }

})();