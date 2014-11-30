(function() {

    angular
        .module('flashCards')
        .controller('catalogController', catalogController);

    catalogController.$inject = ['$scope', '$location', 'flashCardService'];

    function catalogController($scope, $location, flashCardService) {
        $scope = {
            catalogNames: [],
            navigate: navigate
        }

        activate();

        function activate() {
            service.catalogNames()
               .done(function (data) {
                   $scope.catalogNames = data;
               });
        }

        function navigate(name) {
            var url = '/cards/' + encodeURIComponent(name) + "/ids/0";
            $location.path(url);
        }
    }
    
})();