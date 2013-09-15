define(['plugins/router', 'services/cardData', 'services/selectedDeck'], function(router, cardData, selectedDeck) {

    var attached = function() {
        window.scrollTo(0, 1);
    };

    var deckSelected = function(deckName) {
        selectedDeck.setSelectedDeck(deckName);
        router.navigate('#/cards');
    };

    return {
        attached: attached,
        decks: cardData.listOfDecks,
        deckSelected: deckSelected
    };
    
});