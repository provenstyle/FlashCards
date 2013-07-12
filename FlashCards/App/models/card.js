define([], function() {

    var card = function(front, back) {
        this.front = ko.observable(front);
        this.back = ko.observable(back);
    };

    return card;
});