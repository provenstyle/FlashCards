define(['durandal/system'], function (system) {
   var pickRandom = function (list) {
         var index = randomBetween(0, list.length - 1);
         system.log("Random Index: " + index);
         return index;
      },
       randomBetween = function (a, b) {
          return Math.floor((Math.random() * (b - a + 1))) + a;
       };
   return {
      pickRandom: pickRandom,
      randomBetween: randomBetween
   };
});