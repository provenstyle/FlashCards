define(['services/flashCardService', 'plugins/observable', 'plugins/router'], function(service, observable, router) {

   var vm = {};

   vm.selectedName = '';
   vm.index = 0;
   vm.card = {};
   vm.cards = [];
   vm.cardCount = 0;
   vm.failed = false;

   vm.activate = function(name, index) {
      return service.getCards(name)
         .done(function(data) {
            vm.cards = data;
            vm.selectedName = name;
            vm.cardCount = vm.cards.length;
            selectCard(index);
         })
         .fail(function() {
            vm.failed = true;
         });
   };

   function selectCard(index) {
      index = parseInt(index);
      if (index && index >= 0 && index < vm.cards.length) {
         vm.card = vm.cards[index];
         vm.index = index;
      } else {
         vm.card = vm.cards[0];
      }
   }

   vm.flip = function() {

   };


   observable.defineProperty(vm, 'hasPrevious', function() {
      return true;
   });
   
   observable.defineProperty(vm, 'hasNext', function () {
      return true;
   });
   
   vm.previous = function () {
      navigate(vm.index - 1);
   };
   
   vm.next = function () {
      navigate(vm.index + 1);
   };

   function navigate(index) {
      router.navigate('#cards/' + encodeURIComponent(vm.selectedName) + '/' + index);
   }

   return vm;

});