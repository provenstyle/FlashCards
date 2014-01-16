define(['services/flashCardService'], function (service) {

   var vm = {};
   vm.catalogNames = [];

   vm.activate = function () {
      return service.catalogNames()
         .done(function (data) {
            vm.catalogNames = data;
      });
   };

   return vm;
});