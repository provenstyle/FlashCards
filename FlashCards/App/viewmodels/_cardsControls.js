define(['durandal/app', 'services/selectedDeck'], function (app, deck) {

    var next = function() {
            deck.next();
            updateCard();
        },
        previous = function() {
            deck.previous();
            updateCard();
        },
        updateCard = function() {
            app.trigger("updateCard");
        };
    
    return {
        previous: previous,
        next: next,
        hasPrevious: deck.hasPrevious,
        hasNext: deck.hasNext
    };
});