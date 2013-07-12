define(['durandal/plugins/router', 'services/cardData', 'services/selectedDeck'], function(router, cardData, selectedDeck) {

    var deckSelected = function(deckName) {
        selectedDeck.setSelectedDeck(deckName);
        router.navigateTo('#/cards');
    };

    return {
        decks: cardData.listOfDecks,
        deckSelected: deckSelected
    };
    
});