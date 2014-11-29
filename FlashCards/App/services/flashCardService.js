define(['durandal/system',
      'mockData/multiplication',
      'mockData/statesAndCapitals',
      'mockData/angular'
   ], function(system, multiplication, states, angular) {

      var data = {
         "Multiplication": multiplication.cards,
         "States and Capitals": states.cards,
         "Angular": angular.cards,
      };

      var names = [];

      for (var prop in data) {
         if (data.hasOwnProperty(prop)) {
            names.push(prop);
         }
      }

      var service = {};

      service.catalogNames = function() {
         system.log("******** Getting catalog names");
         return system.defer(function(dfd) {
            dfd.resolve(names);
         });
      };

      service.getCards = function(name) {
         system.log("******** Getting cards");
         return system.defer(function(dfd) {
            if (data[name]) {
               dfd.resolve(data[name]);
            } else {
               dfd.reject();
            }
         });
      };

      return service;
   });