define(['durandal/app', 'services/logger'], function(app, logger) {
    var random = ko.observable(false),
        randomChanged = function () {
            logger.log("Random checkbox value: " + random());
            app.trigger("random", random());
            return true;
        };

    return {
        random: random,
        randomChanged: randomChanged
    };
});