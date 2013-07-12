define(['models/card'], function(card) {

    var cards = [
        new card("RequireJS uses r.js to bundle and minify your AMD modules.", "True"),
        new card("AMD stands for Asynchronous Module Definition.", "True")
    ];

    return {
        cards: cards
    };
});