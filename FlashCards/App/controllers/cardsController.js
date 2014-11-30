(function () {

    angular
        .module('flashCards')
        .controller('cardsController', cardsController);

    cardsController.$inject = ['$scope', '$routeParams', '$location', 'selectedCards'];

    function cardsController($scope, $routeParams, $location, selectedCards) {

        $scope.selected = selectedCards;
        $scope.previous = previous;
        $scope.next = next;
        $scope.flip = flip;

        activate();

        function activate() {
            var name = decodeURIComponent($routeParams.name);
            var id = $routeParams.id;
            selectedCards.select(name)
                .then(function() {
                    selectedCards.setIndex(id);
                });
        }

         function previous() {
            if (selectedCards.hasPrevious()) {
                navigate(selectedCards.previousIndex());
            }
         }

         function next() {
             if (selectedCards.hasNext()) {
                 navigate(selectedCards.nextIndex());
             }
         }

         function flip() {
             $('.card').toggleClass('flip');
         }

         function navigate(index) {
             var url = '/cards/' + encodeURIComponent(selectedCards.name) + '/ids/' + index;
             $location.path(url);
         }
    }

})();
