define(['services/selectedDeck'], function (deck) {

    var front = true,
        deckName = ko.observable(),
        cardText = ko.observable(),
        cardHeading = ko.observable(),
        activate = function() {
            updateCard();
        },
        viewAttached = function() {
            window.scrollTo(0, 1);
        },
        flip = function() {
            if (front === true) {
                cardText(deck.currentCard().back());
                cardHeading(deck.backHeading());
                front = false;
            } else {
                cardText(deck.currentCard().front());
                cardHeading(deck.frontHeading());
                front = true;
            }
        },
        next = function() {
            deck.next();
            updateCard();
        },
        previous = function() {
            deck.previous();
            updateCard();
        },
        updateCard = function () {
            deckName(deck.deckName());
            cardText(deck.currentCard().front());
            cardHeading(deck.frontHeading());
            front = true;
        },
        cardCount = ko.computed(function() {
            var current = deck.currentCardId() + 1;
            return current + " of " + deck.cardCount();
        }, this);
        
    return {
        activate: activate,
        viewAttached: viewAttached,
        deckName: deckName,  
        cardText: cardText,
        cardHeading: cardHeading,
        flip: flip,
        previous: previous,
        next: next,
        hasPrevious: deck.hasPrevious,
        hasNext: deck.hasNext,
        cardCount: cardCount
      
    };
});