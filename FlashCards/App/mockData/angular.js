define(['models/card'], function(card) {

    var cards = [
        new card("True or False:", "Angular.js considers itself a JavaScript library.", "False:", "Angular.js considers itself a JavaScript framework."),
        new card("True or False:", "Angular.js has a built in module loader.",      "True:", ""),
        new card("True or False:", "Testablility is a major goal of Angular.js?", "True:", "")
    ];

    return {
        cards: cards
    };
});