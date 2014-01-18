define(['models/selectedCards'], function (selectedCards) {
   var vm = {};
   
   vm.selected = selectedCards;   
   
   vm.activate = function (name, index) {
      selectedCards.index = index;
   };

   vm.attached = function() {
      selectedCards.setIndex(selectedCards.index);
   };

   vm.flip = function() {
      $('.card').toggleClass('flip');
   };

   return vm;
});