define(['durandal/system', 'plugins/router', 'models/selectedCards'], function (system, router, selectedCards) {

    var vm = {}, nameParam = '', indexParam = 0;

   vm.selected = selectedCards;

   vm.activate = function (name, index) {
      nameParam = name;
      indexParam = index;
   };

   vm.attached = function () {
       selectedCards.setIndex(indexParam);
   };

   vm.binding = function() {
      return selectedCards.select(nameParam);
   };

   vm.previous = function () {
      if (selectedCards.hasPrevious) {
         navigate(selectedCards.previousIndex());
      }
   };

   vm.next = function() {
      if (selectedCards.hasNext) {
         navigate(selectedCards.nextIndex());
      }
   };

   vm.flip = function () {
       $('.card').toggleClass('flip');
   };

   function navigate(index) {
      var url = '#cards/' + encodeURIComponent(selectedCards.name) + '/ids/' + index;
      system.log(url);
      router.navigate(url);
   }

   return vm;

});