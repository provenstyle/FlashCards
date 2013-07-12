define(['models/card'], function(card) {

    var cards = [
        new card("2 * 2", "4"),
        new card("12 * 1", "12"),
        new card("12 * 2", "24"),
        new card("12 * 3", "36"),
        new card("12 * 4", "48"),
        new card("12 * 5", "60"),
        new card("12 * 6", "72"),
        new card("12 * 7", "84"),
        new card("12 * 8", "96"),
        new card("12 * 9", "108"),
        new card("12 * 10", "120"),
        new card("12 * 11", "132"),
        new card("12 * 12", "144")        
    ];

    return {
        cards: cards
    };
});