(function () {
    angular
        .module('flashCards')
        .factory('flashCardService', flashCardService);

    flashCardService.$inject = ['$q', 'angularMockData', 'multiplicationMockData', 'statesAndCapitalsMockData'];

    function flashCardService($q, angular, multiplication, statesAndCapitals) {
        
        var data = {
            "Multiplication": multiplication.cards,
            "States and Capitals": statesAndCapitals.cards,
            "Angular": angular.cards,
        };

        return {
            catalogNames: catalogNames,
            getCards: getCards
        }

        function catalogNames() {
            return $q(function (resolve) {
                var names = [];
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        names.push(prop);
                    }
                }
                resolve(names);
            });
        }

        function getCards(name) {
            return $q(function(resolve, reject) {
                if (data[name]) {
                    resolve(data[name]);
                } else {
                    reject();
                }
            });
        }
    }
})();