define(['durandal/plugins/router', 'services/cardData', 'services/selectedDeck'], function(router, cardData, selectedDeck) {

    var viewAttached = function() {
        window.scrollTo(0, 1);
    };

    var deckSelected = function(deckName) {
        selectedDeck.setSelectedDeck(deckName);
        router.navigateTo('#/cards');
    };

    return {
        viewAttached: viewAttached,
        decks: cardData.listOfDecks,
        deckSelected: deckSelected
    };
    
});