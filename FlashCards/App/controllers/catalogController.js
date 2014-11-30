(function() {

    angular
        .module('flashCards')
        .controller('catalogController', catalogController);

    catalogController.$inject = ['$scope', '$location', 'flashCardService'];

    function catalogController($scope, $location, flashCardService) {
        $scope.catalogNames = [];
        $scope.navigate = navigate;

        activate();

        function activate() {
            flashCardService.catalogNames()
               .then(function (data) {
                   $scope.catalogNames = data;
               });
        }

        function navigate(name) {
            var url = '/cards/' + encodeURIComponent(name) + "/ids/0";
            $location.path(url);
        }
    }
    
})();