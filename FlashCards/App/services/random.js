define(['services/logger'], function (logger) {
    var pickRandom = function (list) {
            var index = randomBetween(0, list.length - 1);
            logger.log("Random Index: " + index);
            return index;
        },
        randomBetween = function (a, b) {
            return Math.floor((Math.random() * (b - a + 1))) + a;
        };
    return {
        pickRandom: pickRandom,
        randomBetween: randomBetween
    };
});