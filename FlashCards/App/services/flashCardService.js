define(['durandal/system',
        'mockData/multiplication',
        'mockData/statesAndCapitals',
        'mockData/durandal',
        'mockData/requirejs'
   ], function (system, multiplication, states, durandaljs, requirejs) {

   var names = [
      "Multiplication",
      "States and Capitals",
      "Durandal",
      "RequireJS"
   ];
   var service = {};

   service.catalogNames = function() {
      return system.defer(function(dfd) {
         dfd.resolve(names);
      });
   };

   service.getCards = function(name) {
      return system.defer(function(dfd) {

         switch (name) {
            case names[0]:
               dfd.resolve(multiplication.cards);
               break;
               
            case names[1]:
               dfd.resolve(states.cards);
               break;
               
            case names[2]:
               dfd.resolve(durandaljs.cards);
               break;
               
            case names[3]:
               dfd.resolve(requirejs.cards);
               break;
            
            default:
               dfd.reject();
         }

      });
   };

   return service;
});