(function() {

    angular
        .module('flashCards')
        .factory('selectedCards', selectedCards);

    selectedCards.$inject = ['flashCardService'];

    function selectedCards(flashCardService) {

        var module = {
            name: '',
            cards: [],
            card: {},
            index: 0,
            found: false,
            select: select,
            setIndex: setIndex,
            nextIndex: nextIndex,
            previousIndex: previousIndex,
            hasNext: hasNext,
            hasPrevious: hasPrevious,
            selectedOf: selectedOf
        };

        return module;

        function select(name) {
            return flashCardService.getCards(name)
               .then(function (data) {
                   module.found = true;
                   module.cards = data;
                   module.name = name;
                   module.index = 0;
                   module.card = module.cards[0];
               }, function() {
                   module.found = false;
               });
        }

        function setIndex(index) {
            index = parseInt(index);
            if (index < 0 || index > module.cards.length - 1) {
                module.found = false;
                return;
            }
            module.index = index;
            module.card = module.cards[index];
        }

        function nextIndex() {
            if (module.index < module.cards.length - 1)
                return module.index + 1;

            return module.cards.length - 1;
        }

        function previousIndex() {
            if (module.index < 1) return 0;
            return module.index - 1;
        }

        //These were observable
        function hasNext() {
            return module.index < module.cards.length - 1;
        }

        function hasPrevious() {
            return module.index > 0;
        }

        function selectedOf() {
            if (!module.cards || module.cards.length === 0) return '';
            return (module.index + 1) + " of " + module.cards.length;
        }
    }

})();