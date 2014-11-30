define(['models/card'], function(card) {

    var cards = [
        new card("True or False:", "Durandal is a data access framework for JavaScript.", "False:", "Durandal is Single-Page Application framework."),
        new card("True or False:", "Durandal has writen its own module loader.",          "False:", "Durandal uses RequireJS as it module loader.")
    ];

    return {
        cards: cards
    };
});