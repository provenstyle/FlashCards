define(['services/flashCardService'], function (service) {
   var vm = {};

   vm.card = {};
   vm.failed = false;
   
   vm.activate = function (name, index, c) {

      var args = arguments;

      return service.getCard(name, index)
         .done(function(data) {
            vm.card = data;
         })
         .fail(function() {
            vm.failed = true;
         });
   };

   vm.flip = function() {

   };

   return vm;
});