define(['services/selectedDeck'], function (deck) {

    var deckName = ko.observable(),
        card = ko.observable(),
        cardHeading = ko.observable(),
        activate = function() {
            updateCard();
        },
        viewAttached = function() {
            window.scrollTo(0, 1);
        },
        flip = function () {
            $('.card').toggleClass('flip');            
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
            $('.card').removeClass('flip');
            deckName(deck.deckName());
            card(deck.currentCard());
        },
        cardCount = ko.computed(function() {
            var current = deck.currentCardId() + 1;
            return current + " of " + deck.cardCount();
        }, this);
        
    return {
        activate: activate,
        viewAttached: viewAttached,        
        deckName: deckName,
        card:card,                
        flip: flip,
        previous: previous,
        next: next,
        hasPrevious: deck.hasPrevious,
        hasNext: deck.hasNext,
        cardCount: cardCount
      
    };
});