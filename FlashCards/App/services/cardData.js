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
        { name: 'Multiplication', frontHeading:"Question:", backHeading:"Answer:",  cards: multiplication.cards },
        { name: 'States and Capitals', frontHeading:"State:", backHeading:"Capital:",  cards: statesAndCapitals.cards },
        { name: 'Durandal', frontHeading:"True or False:", backHeading:"Answer:",  cards: durandal.cards },
        { name: 'RequireJS', frontHeading:"True or False:", backHeading:"Answer:",  cards: requirejs.cards }
    ];

    return {
        listOfDecks: listOfDecks,
        getDeck: getDeck
    };
});