define(['models/selectedCards'], function (selectedCards) {
   var vm = {};
   vm.selected = selectedCards;   
   
   vm.activate = function (name, index) {
      selectedCards.setIndex(index);
   };

   vm.flip = function() {
      $('.card').toggleClass('flip');
   };

   return vm;
});