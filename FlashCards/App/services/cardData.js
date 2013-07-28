define(['data/multiplication',
        'data/statesAndCapitals',
        'data/durandal',
        'data/requirejs'
    ],
    function (multiplication, statesAndCapitals, durandal, requirejs) {

    var listOfDecks = [
        "Multiplication",
        "States and Capitals",
        "Durandal",
        "RequireJS"
    ];

    var getDeck = function (deckName) {
        var count = decks.length;
        for (var i = 0; i < count; i++) {
            if (decks[i].name === deckName) {
                return decks[i];
            }
        }
        return[];
    };

    var decks = [
        { name: 'Multiplication',       cards: multiplication.cards },
        { name: 'States and Capitals',  cards: statesAndCapitals.cards },
        { name: 'Durandal',             cards: durandal.cards },
        { name: 'RequireJS',            cards: requirejs.cards }
    ];

    return {
        listOfDecks: listOfDecks,
        getDeck: getDeck
    };
});