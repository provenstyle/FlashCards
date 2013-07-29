define(['durandal/app', 'services/cardData', 'services/random'], function (app, cardData, randomPicker) {

    var selectedDeckName = ko.observable("Multiplication"),
        currentCardId = ko.observable(0),
        pickRandom = ko.observable(false),
        setSelectedDeck = function(name) {
            selectedDeckName(name);
            currentCardId(0);
            app.trigger('updateCard');
        },
        selectedDeck = ko.computed(function() {
            var deck = cardData.getDeck(selectedDeckName());
            return deck;
        }, this),
        currentCard = ko.computed(function() {
            return selectedDeck().cards[currentCardId()];
        }, this),
        next = function() {
            if (pickRandom()) {
                var id = randomPicker.pickRandom(selectedDeck().cards);
                currentCardId(id);
                return;
            }

            if (currentCardId() < selectedDeck().cards.length - 1) {
                currentCardId(currentCardId() + 1);
            }
        },
        previous = function() {
            if (currentCardId() > 0) {
                currentCardId(currentCardId() - 1);
            }
        },
        hasNext = ko.computed(function() {
            if (pickRandom()) return true;
            return currentCardId() < selectedDeck().cards.length - 1;
        }, this),
        hasPrevious = ko.computed(function() {
            if (pickRandom()) return false;
            return currentCardId() > 0;
        }, this),
        cardCount = ko.computed(function() {
            return selectedDeck().cards.length;
        }, this),
        deckName = ko.computed(function() {
            return selectedDeck().name;
        }, this);
        
    app.on('random').then(function(value) {
        pickRandom(value);
    });
        
    return {
        setSelectedDeck: setSelectedDeck,        
        deckName: deckName,
        currentCard: currentCard,
        currentCardId: currentCardId,
        next: next,
        previous: previous,
        hasNext: hasNext,
        hasPrevious: hasPrevious,
        cardCount: cardCount
    };
});