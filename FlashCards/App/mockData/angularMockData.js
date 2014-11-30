(function() {
    angular
        .module('flashCards')
        .factory('angularMockData', angularMockData);
    
    angularMockData.$inject = ['cardFactory'];

    function angularMockData(cardFactory) {
        return {
            cards: [
                 cardFactory.create("True or False:", "Angular.js considers itself a JavaScript library.", "False:", "Angular.js considers itself a JavaScript framework."),
                 cardFactory.create("True or False:", "Angular.js has a built in module loader.",      "True:", ""),
                 cardFactory.create("True or False:", "Testablility is a major goal of Angular.js?", "True:", "")
            ] 
        }
    }

})();