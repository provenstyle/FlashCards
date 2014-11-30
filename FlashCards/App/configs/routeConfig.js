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

            .otherwise({
                redirectTo: '/'
            });
    }

})();