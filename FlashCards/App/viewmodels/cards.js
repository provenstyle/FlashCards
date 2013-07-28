define([], function () {

    var viewAttached = function() {
        window.scrollTo(0, 1);
    };

    return {        
        viewAttached: viewAttached,                
    };
});