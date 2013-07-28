define(['durandal/app', 'services/selectedDeck', 'services/logger'], function (app, deck, logger) {

    var deckName = ko.observable(deck.deckName()),
        card = ko.observable(deck.currentCard()),
        random = ko.observable(false),
        activate = function() {
            updateCard();
        },
        viewAttached = function() {
            window.scrollTo(0, 1);
        },
        flip = function() {
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
        updateCard = function() {
            deckName(deck.deckName());
            if ($('.card').hasClass('flip')) {
                setTimeout(function() {
                    card(deck.currentCard());
                }, 400);
            } else {
                card(deck.currentCard());
            }
            $('.card').removeClass('flip');
        },
        cardCount = ko.computed(function() {
            var current = deck.currentCardId() + 1;
            return current + " of " + deck.cardCount();
        }, this),
        randomChanged = function() {
            logger.log("Random checkbox value: " + random());
            app.trigger("random", random());
            return true;
        };
        
    return {
        activate: activate,
        viewAttached: viewAttached,        
        deckName: deckName,
        card: card,
        random: random,
        flip: flip,
        previous: previous,
        next: next,
        hasPrevious: deck.hasPrevious,
        hasNext: deck.hasNext,
        cardCount: cardCount,
        randomChanged: randomChanged
    };
});