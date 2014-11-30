(function () {

    angular
        .module('flashCards')
        .factory('statesAndCapitalsMockData', statesAndCapitalsMockData);

    statesAndCapitalsMockData.$inject = ['cardFactory'];

    function statesAndCapitalsMockData(cardFactory) {
        return {
            cards: [
                cardFactory.create("State:", "Alabama", "Capital:", "Montgomery"),
                cardFactory.create("State:", "Alaska", "Capital:", "Juneau"),
                cardFactory.create("State:", "Arizona", "Capital:", "Phoenix"),
                cardFactory.create("State:", "Arkansas", "Capital:", "Little Rock"),
                cardFactory.create("State:", "California", "Capital:", "Sacramento"),
                cardFactory.create("State:", "Colorado", "Capital:", "Denver"),
                cardFactory.create("State:", "Connecticut", "Capital:", "Hartford"),
                cardFactory.create("State:", "Delaware", "Capital:", "Dover"),
                cardFactory.create("State:", "Florida", "Capital:", "Tallahassee"),
                cardFactory.create("State:", "Georgia", "Capital:", "Atlanta"),
                cardFactory.create("State:", "Hawaii", "Capital:", "Honolulu"),
                cardFactory.create("State:", "Idaho", "Capital:", "Boise"),
                cardFactory.create("State:", "Illinois", "Capital:", "Springfield"),
                cardFactory.create("State:", "Indiana", "Capital:", "Indianapolis"),
                cardFactory.create("State:", "Iowa", "Capital:", "Des Moines"),
                cardFactory.create("State:", "Kansas", "Capital:", "Topeka"),
                cardFactory.create("State:", "Kentucky", "Capital:", "Frankfort"),
                cardFactory.create("State:", "Louisiana", "Capital:", "Baton Rouge"),
                cardFactory.create("State:", "Maine", "Capital:", "Augusta"),
                cardFactory.create("State:", "Maryland", "Capital:", "Annapolis"),
                cardFactory.create("State:", "Massachusetts", "Capital:", "Boston"),
                cardFactory.create("State:", "Michigan", "Capital:", "Lansing"),
                cardFactory.create("State:", "Minnesota", "Capital:", "St. Paul"),
                cardFactory.create("State:", "Mississippi", "Capital:", "Jackson"),
                cardFactory.create("State:", "Missouri", "Capital:", "Jefferson City"),
                cardFactory.create("State:", "Montana", "Capital:", "Helena"),
                cardFactory.create("State:", "Nebraska", "Capital:", "Lincoln"),
                cardFactory.create("State:", "Nevada", "Capital:", "Carson City"),
                cardFactory.create("State:", "New Hampshire", "Capital:", "Concord"),
                cardFactory.create("State:", "New Jersey", "Capital:", "Trenton"),
                cardFactory.create("State:", "New Mexico", "Capital:", "Santa Fe"),
                cardFactory.create("State:", "New York", "Capital:", "Albany"),
                cardFactory.create("State:", "North Carolina", "Capital:", "Raleigh"),
                cardFactory.create("State:", "North Dakota", "Capital:", "Bismarck"),
                cardFactory.create("State:", "Ohio", "Capital:", "Columbus"),
                cardFactory.create("State:", "Oklahoma", "Capital:", "Oklahoma City"),
                cardFactory.create("State:", "Oregon", "Capital:", "Salem"),
                cardFactory.create("State:", "Pennsylvania", "Capital:", "Harrisburg"),
                cardFactory.create("State:", "Rhode Island", "Capital:", "Providence"),
                cardFactory.create("State:", "South Carolina", "Capital:", "Columbia"),
                cardFactory.create("State:", "South Dakota", "Capital:", "Pierre"),
                cardFactory.create("State:", "Tennessee", "Capital:", "Nashville"),
                cardFactory.create("State:", "Texas", "Capital:", "Austin"),
                cardFactory.create("State:", "Utah", "Capital:", "Salt Lake City"),
                cardFactory.create("State:", "Vermont", "Capital:", "Montpelier"),
                cardFactory.create("State:", "Virginia", "Capital:", "Richmond"),
                cardFactory.create("State:", "Washington", "Capital:", "Olympia"),
                cardFactory.create("State:", "West Virginia", "Capital:", "Charleston"),
                cardFactory.create("State:", "Wisconsin", "Capital:", "Madison"),
                cardFactory.create("State:", "Wyoming", "Capital:", "Cheyenne")
            ]
        }
    }

})();