define(['plugins/observable', 'services/flashCardService', 'models/random'], function(observable, service, random) {
   var module = {
      name:'',
      cards:[],
      card: {},
      index: 0,
      found: false,
      random: false
   };

   function setCurrentCard(index) {
      module.card = module.cards[index];
      module.index = index;
   }

   module.select = function(name) {
      return service.getCards(name)
         .done(function (data) {
               module.found = true;
               module.cards = data;               
               module.name = name;
               setCurrentCard(0);               
         })
         .fail(function() {
            module.found = false;
         });
   };

   module.next = function () {
      if (module.random) {
         var index = random.pickRandom(cards);
         setCurrentCard(index);
         return;
      }

      if (module.index < module.cards.length - 1) {
         setCurrentCard(module.index + 1);         
      }
   };

   module.previous = function() {
      if (module.index > 0) {
         setCurrentCard(module.index - 1);         
      }
   };

   observable.defineProperty(module, "hasNext", function() {
      if (module.random) return true;
      return module.index < cards.length - 1;
   });
   
   observable.defineProperty(module, "hasPrevious", function() {
      if (module.random) return false;
      return module.index > 0;
   });
   
   observable.defineProperty(module, "selectedOf", function () {
      if (!module.cards || module.cards.length === 0) return '';
      return (module.index + 1) + " of " + module.cards.length;
   });

   observable.convertObject(module);

   return module;
});