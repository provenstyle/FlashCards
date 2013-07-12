define(['services/cardData'], function(cardData) {

    var selectedDeckName = ko.observable("Multiplication"),
        currentCardId = ko.observable(0),
        setSelectedDeck = function(deckName) {
            selectedDeckName(deckName);
            currentCardId(0);
        },
        selectedDeck = ko.computed(function() {
            var deck = cardData.getDeck(selectedDeckName());
            return deck;
        }, this),
        currentCard = ko.computed(function() {
            return selectedDeck().cards[currentCardId()];
        }, this),
        next = function() {
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
            return currentCardId() < selectedDeck().cards.length - 1;
        }, this),
        hasPrevious = ko.computed(function() {
            return currentCardId() > 0;
        }, this),
        cardCount = ko.computed(function() {
            return selectedDeck().cards.length;
        }, this),
        deckName = ko.computed(function () {
            return selectedDeck().name;
        }, this);
        frontHeading = ko.computed(function() {
            return selectedDeck().frontHeading;
        }, this),
        backHeading = ko.computed(function() {
            return selectedDeck().backHeading;
        }, this);
    
        
    return {
        setSelectedDeck: setSelectedDeck,        
        currentCard: currentCard,
        currentCardId: currentCardId,
        next: next,
        previous: previous,
        hasNext: hasNext,
        hasPrevious: hasPrevious,
        cardCount: cardCount,
        deckName: deckName,
        frontHeading: frontHeading,
        backHeading: backHeading
    };
});