define(['durandal/system'], function(system) {

   var service = {};

   service.catalogNames = function() {
      return system.defer(function(dfd) {
         dfd.resolve([
           "Multiplication",
           "States and Capitals",
           "Durandal",
           "RequireJS"
         ]);
      });
   };

   return service;
});