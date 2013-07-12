define(['models/card'], function(card) {

    var cards = [
        new card("Durandal is an data access framework for JavaScript.", "False - Durandal is Single-Page Application framework."),
        new card("Durandal has writen its own module loader.", "False, Durandal uses RequireJS as it module loader.")
    ];

    return {
        cards: cards
    };
});