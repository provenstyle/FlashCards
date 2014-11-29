define(['models/selectedCards'], function(selectedCards) {
   var vm = {},
      indexParam = 0;

   vm.selected = selectedCards;

   vm.activate = function(name, index) {
      indexParam = index;
   };

   vm.attached = function() {
      selectedCards.setIndex(indexParam);
   };

   vm.flip = function() {
      $('.card').toggleClass('flip');
   };

   return vm;
});