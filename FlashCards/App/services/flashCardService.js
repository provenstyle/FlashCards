define(['durandal/system',
        'mockData/multiplication',
        'mockData/statesAndCapitals',
        'mockData/durandal',
        'mockData/requirejs'
], function (system, multiplication, states, durandaljs, requirejs) {

   var data = {
      "Multiplication": multiplication.cards,
      "States and Capitals": states.cards,
      "Durandal": durandaljs.cards,
      "RequireJS": requirejs.cards
   };

   var names = [];

   for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
         names.push(prop);
      }
   }

   var service = {};

   service.catalogNames = function () {
      return system.defer(function (dfd) {
         dfd.resolve(names);
      });
   };

   service.getCard = function (name, index) {
      index = parseInt(index);
      return system.defer(function (dfd) {
         if (data[name] && data[name][index]) {
            dfd.resolve(data[name][index]);
         } else {
            dfd.reject();
         }
      });
   };

   return service;
});