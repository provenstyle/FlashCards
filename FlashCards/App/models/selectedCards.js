define(['durandal/app', 'durandal/system', 'plugins/observable', 'services/flashCardService', 'models/random'], function(app, system, observable, service, random) {
   var module = {
      name:'',
      cards:[],
      card: {},
      index: 0,
      found: false,
      random: false
   };

   app.on('randomChanged').then(function (data) {
      system.log('Random changed: ' + data);
      module.random = data;
   });

   module.select = function(name) {
      return service.getCards(name)
         .done(function (data) {
               module.found = true;
               module.cards = data;
               module.name = name;
               module.index = 0;
               module.card = module.cards[0];
         })
         .fail(function() {
            module.found = false;
         });
   };

   module.setIndex = function (index) {
      index = parseInt(index);
      if (index < 0 || index > module.cards.length - 1) {
         module.found = false;
         return;
      }
      module.index = index;
      module.card = module.cards[index];
   };

   module.nextIndex = function () {
      if (module.random)
         return random.pickRandom(module.cards);

      if (module.index < module.cards.length - 1)
         return module.index + 1;

      return module.cards.length - 1;
   };

   module.previousIndex = function() {
      if (module.index < 1) return 0;
      return module.index - 1;      
   };

   observable.defineProperty(module, "hasNext", function() {
      if (module.random) return true;
      return module.index < module.cards.length - 1;
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