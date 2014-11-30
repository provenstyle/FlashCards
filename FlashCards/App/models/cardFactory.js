(function () {

    angular
        .module('flashCards')
        .factory('cardFactory', cardFactory);

    function cardFactory() {
        return {
            create: create
        }
    }

    function create(frontHeading, front, backHeading, back) {
        return new Card(frontHeading, front, backHeading, back);
    }

    function Card(frontHeading, front, backHeading, back) {
        this.frontHeading = frontHeading;
        this.front = front;
        this.backHeading = backHeading;
        this.back = back;
    }
})();
