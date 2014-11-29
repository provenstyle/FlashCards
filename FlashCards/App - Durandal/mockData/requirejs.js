define(['models/card'], function(card) {

    var cards = [
        new card("True or False:", "RequireJS uses r.js to bundle and minify your AMD modules.", "True", ""),
        new card("True or False:", "AMD stands for Asynchronous Module Definition.",             "True", "")
    ];

    return {
        cards: cards
    };
});