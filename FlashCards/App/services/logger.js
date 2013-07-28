define([], function() {

    if (!window.console || typeof window.console === "undefined") {
        window.console = {
            log: function(logMessage) {
            }
        };
    }

    var log = function(message) {
        console.log(formatMessage(message));
    },
    formatMessage = function(message) {
        var date = new Date().toLocaleTimeString();
        return date + ": " + message;
    };

    return {
      log: log
    };
});