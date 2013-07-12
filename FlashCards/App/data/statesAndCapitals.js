define(['models/card'], function(card) {

    var cards = [
        new card("Texas", "Austin"),
        new card("New York", "Albany"),
        new card("Delaware", "Dover")        
    ];

    return {
        cards: cards
    };
});