define([], function () {

    var attached = function() {
        window.scrollTo(0, 1);
    };

    return {        
        attached: attached,                
    };
});