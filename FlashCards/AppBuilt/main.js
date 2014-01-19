(function () {
/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    function onResourceLoad(name, defined, deps){
        if(requirejs.onResourceLoad && name){
            requirejs.onResourceLoad({defined:defined}, {id:name}, deps);
        }
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }

        onResourceLoad(name, defined, args);
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../Scripts/almond-custom", function(){});

define('text',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});
define('text!cards/card.html',[],function () { return '<div>        \r\n    <div class="card" data-bind="click: flip">\r\n        <div class="col-xs-12 well front face ">\r\n            <h4 data-bind="text: selected.card.frontHeading"></h4>\r\n            <p data-bind="text: selected.card.front"></p>\r\n        </div>\r\n        <div class="col-xs-12 well back face">\r\n            <h4 data-bind="text: selected.card.backHeading"></h4>\r\n            <p data-bind="text: selected.card.back"></p>\r\n        </div>\r\n    </div>        \r\n</div>    ';});

define('durandal/system',["require","jquery"],function(e,t){function n(e){var t="[object "+e+"]";i["is"+e]=function(e){return s.call(e)==t}}var i,r=!1,a=Object.keys,o=Object.prototype.hasOwnProperty,s=Object.prototype.toString,u=!1,c=Array.isArray,l=Array.prototype.slice;if(Function.prototype.bind&&("object"==typeof console||"function"==typeof console)&&"object"==typeof console.log)try{["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function(e){console[e]=this.call(console[e],console)},Function.prototype.bind)}catch(d){u=!0}e.on&&e.on("moduleLoaded",function(e,t){i.setModuleId(e,t)}),"undefined"!=typeof requirejs&&(requirejs.onResourceLoad=function(e,t){i.setModuleId(e.defined[t.id],t.id)});var f=function(){},v=function(){try{if("undefined"!=typeof console&&"function"==typeof console.log)if(window.opera)for(var e=0;e<arguments.length;)console.log("Item "+(e+1)+": "+arguments[e]),e++;else 1==l.call(arguments).length&&"string"==typeof l.call(arguments)[0]?console.log(l.call(arguments).toString()):console.log.apply(console,l.call(arguments));else Function.prototype.bind&&!u||"undefined"==typeof console||"object"!=typeof console.log||Function.prototype.call.call(console.log,console,l.call(arguments))}catch(t){}},g=function(e){if(e instanceof Error)throw e;throw new Error(e)};i={version:"2.0.1",noop:f,getModuleId:function(e){return e?"function"==typeof e?e.prototype.__moduleId__:"string"==typeof e?null:e.__moduleId__:null},setModuleId:function(e,t){return e?"function"==typeof e?(e.prototype.__moduleId__=t,void 0):("string"!=typeof e&&(e.__moduleId__=t),void 0):void 0},resolveObject:function(e){return i.isFunction(e)?new e:e},debug:function(e){return 1==arguments.length&&(r=e,r?(this.log=v,this.error=g,this.log("Debug:Enabled")):(this.log("Debug:Disabled"),this.log=f,this.error=f)),r},log:f,error:f,assert:function(e,t){e||i.error(new Error(t||"Assert:Failed"))},defer:function(e){return t.Deferred(e)},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=0|16*Math.random(),n="x"==e?t:8|3&t;return n.toString(16)})},acquire:function(){var t,n=arguments[0],r=!1;return i.isArray(n)?(t=n,r=!0):t=l.call(arguments,0),this.defer(function(n){e(t,function(){var e=arguments;setTimeout(function(){e.length>1||r?n.resolve(l.call(e,0)):n.resolve(e[0])},1)},function(e){n.reject(e)})}).promise()},extend:function(e){for(var t=l.call(arguments,1),n=0;n<t.length;n++){var i=t[n];if(i)for(var r in i)e[r]=i[r]}return e},wait:function(e){return i.defer(function(t){setTimeout(t.resolve,e)}).promise()}},i.keys=a||function(e){if(e!==Object(e))throw new TypeError("Invalid object");var t=[];for(var n in e)o.call(e,n)&&(t[t.length]=n);return t},i.isElement=function(e){return!(!e||1!==e.nodeType)},i.isArray=c||function(e){return"[object Array]"==s.call(e)},i.isObject=function(e){return e===Object(e)},i.isBoolean=function(e){return"boolean"==typeof e},i.isPromise=function(e){return e&&i.isFunction(e.then)};for(var p=["Arguments","Function","String","Number","Date","RegExp"],w=0;w<p.length;w++)n(p[w]);return i});
define('durandal/viewEngine',["durandal/system","jquery"],function(e,t){var n;return n=t.parseHTML?function(e){return t.parseHTML(e)}:function(e){return t(e).get()},{viewExtension:".html",viewPlugin:"text",isViewUrl:function(e){return-1!==e.indexOf(this.viewExtension,e.length-this.viewExtension.length)},convertViewUrlToViewId:function(e){return e.substring(0,e.length-this.viewExtension.length)},convertViewIdToRequirePath:function(e){return this.viewPlugin+"!"+e+this.viewExtension},parseMarkup:n,processMarkup:function(e){var t=this.parseMarkup(e);return this.ensureSingleElement(t)},ensureSingleElement:function(e){if(1==e.length)return e[0];for(var n=[],i=0;i<e.length;i++){var r=e[i];if(8!=r.nodeType){if(3==r.nodeType){var a=/\S/.test(r.nodeValue);if(!a)continue}n.push(r)}}return n.length>1?t(n).wrapAll('<div class="durandal-wrapper"></div>').parent().get(0):n[0]},createView:function(t){var n=this,i=this.convertViewIdToRequirePath(t);return e.defer(function(r){e.acquire(i).then(function(e){var i=n.processMarkup(e);i.setAttribute("data-view",t),r.resolve(i)}).fail(function(e){n.createFallbackView(t,i,e).then(function(e){e.setAttribute("data-view",t),r.resolve(e)})})}).promise()},createFallbackView:function(t,n){var i=this,r='View Not Found. Searched for "'+t+'" via path "'+n+'".';return e.defer(function(e){e.resolve(i.processMarkup('<div class="durandal-view-404">'+r+"</div>"))}).promise()}}});
define('durandal/viewLocator',["durandal/system","durandal/viewEngine"],function(e,t){function n(e,t){for(var n=0;n<e.length;n++){var i=e[n],r=i.getAttribute("data-view");if(r==t)return i}}function i(e){return(e+"").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1")}return{useConvention:function(e,t,n){e=e||"viewmodels",t=t||"views",n=n||t;var r=new RegExp(i(e),"gi");this.convertModuleIdToViewId=function(e){return e.replace(r,t)},this.translateViewIdToArea=function(e,t){return t&&"partial"!=t?n+"/"+t+"/"+e:n+"/"+e}},locateViewForObject:function(t,n,i){var r;if(t.getView&&(r=t.getView()))return this.locateView(r,n,i);if(t.viewUrl)return this.locateView(t.viewUrl,n,i);var a=e.getModuleId(t);return a?this.locateView(this.convertModuleIdToViewId(a),n,i):this.locateView(this.determineFallbackViewId(t),n,i)},convertModuleIdToViewId:function(e){return e},determineFallbackViewId:function(e){var t=/function (.{1,})\(/,n=t.exec(e.constructor.toString()),i=n&&n.length>1?n[1]:"";return"views/"+i},translateViewIdToArea:function(e){return e},locateView:function(i,r,a){if("string"==typeof i){var o;if(o=t.isViewUrl(i)?t.convertViewUrlToViewId(i):i,r&&(o=this.translateViewIdToArea(o,r)),a){var s=n(a,o);if(s)return e.defer(function(e){e.resolve(s)}).promise()}return t.createView(o)}return e.defer(function(e){e.resolve(i)}).promise()}}});
define('durandal/binder',["durandal/system","knockout"],function(e,n){function t(n){return void 0===n?{applyBindings:!0}:e.isBoolean(n)?{applyBindings:n}:(void 0===n.applyBindings&&(n.applyBindings=!0),n)}function a(a,c,w,l){if(!c||!w)return i.throwOnErrors?e.error(r):e.log(r,c,l),void 0;if(!c.getAttribute)return i.throwOnErrors?e.error(o):e.log(o,c,l),void 0;var d=c.getAttribute("data-view");try{var f;return a&&a.binding&&(f=a.binding(c)),f=t(f),i.binding(l,c,f),f.applyBindings?(e.log("Binding",d,l),n.applyBindings(w,c)):a&&n.utils.domData.set(c,u,{$data:a}),i.bindingComplete(l,c,f),a&&a.bindingComplete&&a.bindingComplete(c),n.utils.domData.set(c,s,f),f}catch(v){v.message=v.message+";\nView: "+d+";\nModuleId: "+e.getModuleId(l),i.throwOnErrors?e.error(v):e.log(v.message)}}var i,r="Insufficient Information to Bind",o="Unexpected View Type",s="durandal-binding-instruction",u="__ko_bindingContext__";return i={binding:e.noop,bindingComplete:e.noop,throwOnErrors:!1,getBindingInstruction:function(e){return n.utils.domData.get(e,s)},bindContext:function(e,n,t){return t&&e&&(e=e.createChildContext(t)),a(t,n,e,t||(e?e.$data:null))},bind:function(e,n){return a(e,n,e,e)}}});
define('durandal/activator',["durandal/system","knockout"],function(e,n){function t(e){return void 0==e&&(e={}),e.closeOnDeactivate||(e.closeOnDeactivate=w.defaults.closeOnDeactivate),e.beforeActivate||(e.beforeActivate=w.defaults.beforeActivate),e.afterDeactivate||(e.afterDeactivate=w.defaults.afterDeactivate),e.affirmations||(e.affirmations=w.defaults.affirmations),e.interpretResponse||(e.interpretResponse=w.defaults.interpretResponse),e.areSameItem||(e.areSameItem=w.defaults.areSameItem),e}function a(n,t,a){return e.isArray(a)?n[t].apply(n,a):n[t](a)}function i(n,t,a,i,r){if(n&&n.deactivate){e.log("Deactivating",n);var s;try{s=n.deactivate(t)}catch(o){return e.error(o),i.resolve(!1),void 0}s&&s.then?s.then(function(){a.afterDeactivate(n,t,r),i.resolve(!0)},function(n){e.log(n),i.resolve(!1)}):(a.afterDeactivate(n,t,r),i.resolve(!0))}else n&&a.afterDeactivate(n,t,r),i.resolve(!0)}function r(n,t,i,r){if(n)if(n.activate){e.log("Activating",n);var s;try{s=a(n,"activate",r)}catch(o){return e.error(o),i(!1),void 0}s&&s.then?s.then(function(){t(n),i(!0)},function(n){e.log(n),i(!1)}):(t(n),i(!0))}else t(n),i(!0);else i(!0)}function s(n,t,a){return a.lifecycleData=null,e.defer(function(i){if(n&&n.canDeactivate){var r;try{r=n.canDeactivate(t)}catch(s){return e.error(s),i.resolve(!1),void 0}r.then?r.then(function(e){a.lifecycleData=e,i.resolve(a.interpretResponse(e))},function(n){e.error(n),i.resolve(!1)}):(a.lifecycleData=r,i.resolve(a.interpretResponse(r)))}else i.resolve(!0)}).promise()}function o(n,t,i,r){return i.lifecycleData=null,e.defer(function(s){if(n==t())return s.resolve(!0),void 0;if(n&&n.canActivate){var o;try{o=a(n,"canActivate",r)}catch(u){return e.error(u),s.resolve(!1),void 0}o.then?o.then(function(e){i.lifecycleData=e,s.resolve(i.interpretResponse(e))},function(n){e.error(n),s.resolve(!1)}):(i.lifecycleData=o,s.resolve(i.interpretResponse(o)))}else s.resolve(!0)}).promise()}function u(a,u){var w,c=n.observable(null);u=t(u);var l=n.computed({read:function(){return c()},write:function(e){l.viaSetter=!0,l.activateItem(e)}});return l.__activator__=!0,l.settings=u,u.activator=l,l.isActivating=n.observable(!1),l.canDeactivateItem=function(e,n){return s(e,n,u)},l.deactivateItem=function(n,t){return e.defer(function(e){l.canDeactivateItem(n,t).then(function(a){a?i(n,t,u,e,c):(l.notifySubscribers(),e.resolve(!1))})}).promise()},l.canActivateItem=function(e,n){return o(e,c,u,n)},l.activateItem=function(n,t){var a=l.viaSetter;return l.viaSetter=!1,e.defer(function(s){if(l.isActivating())return s.resolve(!1),void 0;l.isActivating(!0);var o=c();return u.areSameItem(o,n,w,t)?(l.isActivating(!1),s.resolve(!0),void 0):(l.canDeactivateItem(o,u.closeOnDeactivate).then(function(d){d?l.canActivateItem(n,t).then(function(d){d?e.defer(function(e){i(o,u.closeOnDeactivate,u,e)}).promise().then(function(){n=u.beforeActivate(n,t),r(n,c,function(e){w=t,l.isActivating(!1),s.resolve(e)},t)}):(a&&l.notifySubscribers(),l.isActivating(!1),s.resolve(!1))}):(a&&l.notifySubscribers(),l.isActivating(!1),s.resolve(!1))}),void 0)}).promise()},l.canActivate=function(){var e;return a?(e=a,a=!1):e=l(),l.canActivateItem(e)},l.activate=function(){var e;return a?(e=a,a=!1):e=l(),l.activateItem(e)},l.canDeactivate=function(e){return l.canDeactivateItem(l(),e)},l.deactivate=function(e){return l.deactivateItem(l(),e)},l.includeIn=function(e){e.canActivate=function(){return l.canActivate()},e.activate=function(){return l.activate()},e.canDeactivate=function(e){return l.canDeactivate(e)},e.deactivate=function(e){return l.deactivate(e)}},u.includeIn?l.includeIn(u.includeIn):a&&l.activate(),l.forItems=function(n){u.closeOnDeactivate=!1,u.determineNextItemToActivate=function(e,n){var t=n-1;return-1==t&&e.length>1?e[1]:t>-1&&t<e.length-1?e[t]:null},u.beforeActivate=function(e){var t=l();if(e){var a=n.indexOf(e);-1==a?n.push(e):e=n()[a]}else e=u.determineNextItemToActivate(n,t?n.indexOf(t):0);return e},u.afterDeactivate=function(e,t){t&&n.remove(e)};var t=l.canDeactivate;l.canDeactivate=function(a){return a?e.defer(function(e){function t(){for(var n=0;n<r.length;n++)if(!r[n])return e.resolve(!1),void 0;e.resolve(!0)}for(var i=n(),r=[],s=0;s<i.length;s++)l.canDeactivateItem(i[s],a).then(function(e){r.push(e),r.length==i.length&&t()})}).promise():t()};var a=l.deactivate;return l.deactivate=function(t){return t?e.defer(function(e){function a(a){l.deactivateItem(a,t).then(function(){r++,n.remove(a),r==s&&e.resolve()})}for(var i=n(),r=0,s=i.length,o=0;s>o;o++)a(i[o])}).promise():a()},l},l}var w,c={closeOnDeactivate:!0,affirmations:["yes","ok","true"],interpretResponse:function(t){return e.isObject(t)&&(t=t.can||!1),e.isString(t)?-1!==n.utils.arrayIndexOf(this.affirmations,t.toLowerCase()):t},areSameItem:function(e,n){return e==n},beforeActivate:function(e){return e},afterDeactivate:function(e,n,t){n&&t&&t(null)}};return w={defaults:c,create:u,isActivator:function(e){return e&&e.__activator__}}});
define('durandal/composition',["durandal/system","durandal/viewLocator","durandal/binder","durandal/viewEngine","durandal/activator","jquery","knockout"],function(e,n,t,i,a,r,o){function s(e){for(var n=[],t={childElements:n,activeView:null},i=o.virtualElements.firstChild(e);i;)1==i.nodeType&&(n.push(i),i.getAttribute(X)&&(t.activeView=i)),i=o.virtualElements.nextSibling(i);return t.activeView||(t.activeView=n[0]),t}function u(){S--,0===S&&setTimeout(function(){for(var n=C.length;n--;)try{C[n]()}catch(t){e.error(t)}C=[]},1)}function c(e){delete e.activeView,delete e.viewElements}function l(n,t,i){if(i)t();else if(n.activate&&n.model&&n.model.activate){var a;try{a=e.isArray(n.activationData)?n.model.activate.apply(n.model,n.activationData):n.model.activate(n.activationData),a&&a.then?a.then(t,function(n){e.error(n),t()}):a||void 0===a?t():(u(),c(n))}catch(r){e.error(r)}}else t()}function d(){var n=this;if(n.activeView&&n.activeView.removeAttribute(X),n.child)try{n.model&&n.model.attached&&(n.composingNewView||n.alwaysTriggerAttach)&&n.model.attached(n.child,n.parent,n),n.attached&&n.attached(n.child,n.parent,n),n.child.setAttribute(X,!0),n.composingNewView&&n.model&&n.model.detached&&o.utils.domNodeDisposal.addDisposeCallback(n.child,function(){try{n.model.detached(n.child,n.parent,n)}catch(t){e.error(t)}})}catch(t){e.error(t)}n.triggerAttach=e.noop}function w(n){if(e.isString(n.transition)){if(n.activeView){if(n.activeView==n.child)return!1;if(!n.child)return!0;if(n.skipTransitionOnSameViewId){var t=n.activeView.getAttribute("data-view"),i=n.child.getAttribute("data-view");return t!=i}}return!0}return!1}function f(e){for(var n=0,t=e.length,i=[];t>n;n++){var a=e[n].cloneNode(!0);i.push(a)}return i}function v(e){var n=f(e.parts),t=h.getParts(n,null,!0),i=h.getParts(e.child);for(var a in t)r(i[a]).replaceWith(t[a])}function m(n){var t,i,a=o.virtualElements.childNodes(n.parent);if(!e.isArray(a)){var r=[];for(t=0,i=a.length;i>t;t++)r[t]=a[t];a=r}for(t=1,i=a.length;i>t;t++)o.removeNode(a[t])}function p(e){o.utils.domData.set(e,I,e.style.display),e.style.display="none"}function g(e){e.style.display=o.utils.domData.get(e,I)}function A(e){var n=e.getAttribute("data-bind");if(!n)return!1;for(var t=0,i=x.length;i>t;t++)if(n.indexOf(x[t])>-1)return!0;return!1}var h,Q={},X="data-active-view",C=[],S=0,y="durandal-composition-data",b="data-part",D=["model","view","transition","area","strategy","activationData"],I="durandal-visibility-data",x=["compose:"],V={complete:function(e){C.push(e)}};return h={composeBindings:x,convertTransitionToModuleId:function(e){return"transitions/"+e},defaultTransitionName:null,current:V,addBindingHandler:function(e,n,t){var i,a,r="composition-handler-"+e;n=n||o.bindingHandlers[e],t=t||function(){return void 0},a=o.bindingHandlers[e]={init:function(e,i,a,s,u){if(S>0){var c={trigger:o.observable(null)};h.current.complete(function(){n.init&&n.init(e,i,a,s,u),n.update&&(o.utils.domData.set(e,r,n),c.trigger("trigger"))}),o.utils.domData.set(e,r,c)}else o.utils.domData.set(e,r,n),n.init&&n.init(e,i,a,s,u);return t(e,i,a,s,u)},update:function(e,n,t,i,a){var s=o.utils.domData.get(e,r);return s.update?s.update(e,n,t,i,a):(s.trigger&&s.trigger(),void 0)}};for(i in n)"init"!==i&&"update"!==i&&(a[i]=n[i])},getParts:function(e,n,t){if(n=n||{},!e)return n;void 0===e.length&&(e=[e]);for(var i=0,a=e.length;a>i;i++){var r=e[i];if(r.getAttribute){if(!t&&A(r))continue;var o=r.getAttribute(b);o&&(n[o]=r),!t&&r.hasChildNodes()&&h.getParts(r.childNodes,n)}}return n},cloneNodes:f,finalize:function(n){if(void 0===n.transition&&(n.transition=this.defaultTransitionName),n.child||n.activeView)if(w(n)){var i=this.convertTransitionToModuleId(n.transition);e.acquire(i).then(function(e){n.transition=e,e(n).then(function(){if(n.cacheViews){if(n.activeView){var e=t.getBindingInstruction(n.activeView);e&&void 0!=e.cacheViews&&!e.cacheViews&&o.removeNode(n.activeView)}}else n.child?m(n):o.virtualElements.emptyNode(n.parent);n.triggerAttach(),u(),c(n)})}).fail(function(n){e.error("Failed to load transition ("+i+"). Details: "+n.message)})}else{if(n.child!=n.activeView){if(n.cacheViews&&n.activeView){var a=t.getBindingInstruction(n.activeView);!a||void 0!=a.cacheViews&&!a.cacheViews?o.removeNode(n.activeView):p(n.activeView)}n.child?(n.cacheViews||m(n),g(n.child)):n.cacheViews||o.virtualElements.emptyNode(n.parent)}n.triggerAttach(),u(),c(n)}else n.cacheViews||o.virtualElements.emptyNode(n.parent),n.triggerAttach(),u(),c(n)},bindAndShow:function(e,n,a){n.child=e,n.composingNewView=n.cacheViews?-1==o.utils.arrayIndexOf(n.viewElements,e):!0,l(n,function(){if(n.binding&&n.binding(n.child,n.parent,n),n.preserveContext&&n.bindingContext)n.composingNewView&&(n.parts&&v(n),p(e),o.virtualElements.prepend(n.parent,e),t.bindContext(n.bindingContext,e,n.model));else if(e){var a=n.model||Q,r=o.dataFor(e);if(r!=a){if(!n.composingNewView)return o.removeNode(e),i.createView(e.getAttribute("data-view")).then(function(e){h.bindAndShow(e,n,!0)}),void 0;n.parts&&v(n),p(e),o.virtualElements.prepend(n.parent,e),t.bind(a,e)}}h.finalize(n)},a)},defaultStrategy:function(e){return n.locateViewForObject(e.model,e.area,e.viewElements)},getSettings:function(n){var t,r=n(),s=o.utils.unwrapObservable(r)||{},u=a.isActivator(r);if(e.isString(s))return s=i.isViewUrl(s)?{view:s}:{model:s,activate:!0};if(t=e.getModuleId(s))return s={model:s,activate:!0};!u&&s.model&&(u=a.isActivator(s.model));for(var c in s)s[c]=-1!=o.utils.arrayIndexOf(D,c)?o.utils.unwrapObservable(s[c]):s[c];return u?s.activate=!1:void 0===s.activate&&(s.activate=!0),s},executeStrategy:function(e){e.strategy(e).then(function(n){h.bindAndShow(n,e)})},inject:function(t){return t.model?t.view?(n.locateView(t.view,t.area,t.viewElements).then(function(e){h.bindAndShow(e,t)}),void 0):(t.strategy||(t.strategy=this.defaultStrategy),e.isString(t.strategy)?e.acquire(t.strategy).then(function(e){t.strategy=e,h.executeStrategy(t)}).fail(function(n){e.error("Failed to load view strategy ("+t.strategy+"). Details: "+n.message)}):this.executeStrategy(t),void 0):(this.bindAndShow(null,t),void 0)},compose:function(t,i,a,r){S++,r||(i=h.getSettings(function(){return i},t)),i.compositionComplete&&C.push(function(){i.compositionComplete(i.child,i.parent,i)}),C.push(function(){i.composingNewView&&i.model&&i.model.compositionComplete&&i.model.compositionComplete(i.child,i.parent,i)});var o=s(t);i.activeView=o.activeView,i.parent=t,i.triggerAttach=d,i.bindingContext=a,i.cacheViews&&!i.viewElements&&(i.viewElements=o.childElements),i.model?e.isString(i.model)?e.acquire(i.model).then(function(n){i.model=e.resolveObject(n),h.inject(i)}).fail(function(n){e.error("Failed to load composed module ("+i.model+"). Details: "+n.message)}):h.inject(i):i.view?(i.area=i.area||"partial",i.preserveContext=!0,n.locateView(i.view,i.area,i.viewElements).then(function(e){h.bindAndShow(e,i)})):this.bindAndShow(null,i)}},o.bindingHandlers.compose={init:function(){return{controlsDescendantBindings:!0}},update:function(e,n,t,a,r){var s=h.getSettings(n,e);if(s.mode){var u=o.utils.domData.get(e,y);if(!u){var c=o.virtualElements.childNodes(e);u={},"inline"===s.mode?u.view=i.ensureSingleElement(c):"templated"===s.mode&&(u.parts=f(c)),o.virtualElements.emptyNode(e),o.utils.domData.set(e,y,u)}"inline"===s.mode?s.view=u.view.cloneNode(!0):"templated"===s.mode&&(s.parts=u.parts),s.preserveContext=!0}h.compose(e,s,r,!0)}},o.virtualElements.allowedBindings.compose=!0,h});
define('durandal/events',["durandal/system"],function(e){var n=/\s+/,t=function(){},i=function(e,n){this.owner=e,this.events=n};return i.prototype.then=function(e,n){return this.callback=e||this.callback,this.context=n||this.context,this.callback?(this.owner.on(this.events,this.callback,this.context),this):this},i.prototype.on=i.prototype.then,i.prototype.off=function(){return this.owner.off(this.events,this.callback,this.context),this},t.prototype.on=function(e,t,a){var r,o,s;if(t){for(r=this.callbacks||(this.callbacks={}),e=e.split(n);o=e.shift();)s=r[o]||(r[o]=[]),s.push(t,a);return this}return new i(this,e)},t.prototype.off=function(t,i,a){var r,o,s,u;if(!(o=this.callbacks))return this;if(!(t||i||a))return delete this.callbacks,this;for(t=t?t.split(n):e.keys(o);r=t.shift();)if((s=o[r])&&(i||a))for(u=s.length-2;u>=0;u-=2)i&&s[u]!==i||a&&s[u+1]!==a||s.splice(u,2);else delete o[r];return this},t.prototype.trigger=function(e){var t,i,a,r,o,s,u,c;if(!(i=this.callbacks))return this;for(c=[],e=e.split(n),r=1,o=arguments.length;o>r;r++)c[r-1]=arguments[r];for(;t=e.shift();){if((u=i.all)&&(u=u.slice()),(a=i[t])&&(a=a.slice()),a)for(r=0,o=a.length;o>r;r+=2)a[r].apply(a[r+1]||this,c);if(u)for(s=[t].concat(c),r=0,o=u.length;o>r;r+=2)u[r].apply(u[r+1]||this,s)}return this},t.prototype.proxy=function(e){var n=this;return function(t){n.trigger(e,t)}},t.includeIn=function(e){e.on=t.prototype.on,e.off=t.prototype.off,e.trigger=t.prototype.trigger,e.proxy=t.prototype.proxy},t});
define('durandal/app',["durandal/system","durandal/viewEngine","durandal/composition","durandal/events","jquery"],function(e,n,t,a,i){function r(){return e.defer(function(n){return 0==o.length?(n.resolve(),void 0):(e.acquire(o).then(function(t){for(var a=0;a<t.length;a++){var i=t[a];if(i.install){var r=u[a];e.isObject(r)||(r={}),i.install(r),e.log("Plugin:Installed "+o[a])}else e.log("Plugin:Loaded "+o[a])}n.resolve()}).fail(function(n){e.error("Failed to load plugin(s). Details: "+n.message)}),void 0)}).promise()}var s,o=[],u=[];return s={title:"Application",configurePlugins:function(n,t){var a=e.keys(n);t=t||"plugins/",-1===t.indexOf("/",t.length-1)&&(t+="/");for(var i=0;i<a.length;i++){var r=a[i];o.push(t+r),u.push(n[r])}},start:function(){return e.log("Application:Starting"),this.title&&(document.title=this.title),e.defer(function(n){i(function(){r().then(function(){n.resolve(),e.log("Application:Started")})})}).promise()},setRoot:function(a,i,r){var s,o={activate:!0,transition:i};s=!r||e.isString(r)?document.getElementById(r||"applicationHost"):r,e.isString(a)?n.isViewUrl(a)?o.view=a:o.model=a:o.model=a,t.compose(s,o)}},a.includeIn(s),s});
define('plugins/observable',["durandal/system","durandal/binder","knockout"],function(e,t,n){function i(e){var t=e[0];return"_"===t||"$"===t}function a(t){return!(!t||void 0===t.nodeType||!e.isNumber(t.nodeType))}function r(e){if(!e||a(e)||e.ko===n||e.jquery)return!1;var t=f.call(e);return-1==w.indexOf(t)&&!(e===!0||e===!1)}function o(e,t){var n=e.__observable__,i=!0;if(!n||!n.__full__){n=n||(e.__observable__={}),n.__full__=!0,v.forEach(function(n){e[n]=function(){i=!1;var e=m[n].apply(t,arguments);return i=!0,e}}),p.forEach(function(n){e[n]=function(){i&&t.valueWillMutate();var a=h[n].apply(e,arguments);return i&&t.valueHasMutated(),a}}),g.forEach(function(n){e[n]=function(){for(var a=0,r=arguments.length;r>a;a++)s(arguments[a]);i&&t.valueWillMutate();var o=h[n].apply(e,arguments);return i&&t.valueHasMutated(),o}}),e.splice=function(){for(var n=2,a=arguments.length;a>n;n++)s(arguments[n]);i&&t.valueWillMutate();var r=h.splice.apply(e,arguments);return i&&t.valueHasMutated(),r};for(var a=0,r=e.length;r>a;a++)s(e[a])}}function s(t){var a,s;if(r(t)&&(a=t.__observable__,!a||!a.__full__)){if(a=a||(t.__observable__={}),a.__full__=!0,e.isArray(t)){var u=n.observableArray(t);o(t,u)}else for(var l in t)i(l)||a[l]||(s=t[l],e.isFunction(s)||c(t,l,s));A&&e.log("Converted",t)}}function u(e,t,n){var i;e(t),i=e.peek(),n?i?i.destroyAll||o(i,e):(i=[],e(i),o(i,e)):s(i)}function c(t,i,a){var r,c,l=t.__observable__||(t.__observable__={});if(void 0===a&&(a=t[i]),e.isArray(a))r=n.observableArray(a),o(a,r),c=!0;else if("function"==typeof a){if(!n.isObservable(a))return null;r=a}else e.isPromise(a)?(r=n.observable(),a.then(function(t){if(e.isArray(t)){var i=n.observableArray(t);o(t,i),t=i}r(t)})):(r=n.observable(a),s(a));return Object.defineProperty(t,i,{configurable:!0,enumerable:!0,get:r,set:n.isWriteableObservable(r)?function(t){t&&e.isPromise(t)?t.then(function(t){u(r,t,e.isArray(t))}):u(r,t,c)}:void 0}),l[i]=r,r}function l(t,i,a){var r,o={owner:t,deferEvaluation:!0};return"function"==typeof a?o.read=a:("value"in a&&e.error('For defineProperty, you must not specify a "value" for the property. You must provide a "get" function.'),"function"!=typeof a.get&&e.error('For defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".'),o.read=a.get,o.write=a.set),r=n.computed(o),t[i]=r,c(t,i,r)}var d,f=Object.prototype.toString,w=["[object Function]","[object String]","[object Boolean]","[object Number]","[object Date]","[object RegExp]"],v=["remove","removeAll","destroy","destroyAll","replace"],p=["pop","reverse","sort","shift","splice"],g=["push","unshift"],h=Array.prototype,m=n.observableArray.fn,A=!1;return d=function(e,t){var i,a,r;return e?(i=e.__observable__,i&&(a=i[t])?a:(r=e[t],n.isObservable(r)?r:c(e,t,r))):null},d.defineProperty=l,d.convertProperty=c,d.convertObject=s,d.install=function(e){var n=t.binding;t.binding=function(e,t,i){i.applyBindings&&!i.skipConversion&&s(e),n(e,t)},A=e.logConversion},d});
define('models/card',[],function(){return function(e,n,t,s){this.frontHeading=e,this.front=n,this.backHeading=t,this.back=s}});
define('mockData/multiplication',["models/card"],function(e){var n=[new e("Question:","1 X 1","Answer:","1"),new e("Question:","1 X 2","Answer:","2"),new e("Question:","1 X 3","Answer:","3"),new e("Question:","1 X 4","Answer:","4"),new e("Question:","1 X 5","Answer:","5"),new e("Question:","1 X 6","Answer:","6"),new e("Question:","1 X 7","Answer:","7"),new e("Question:","1 X 8","Answer:","8"),new e("Question:","1 X 9","Answer:","9"),new e("Question:","1 X 10","Answer:","10"),new e("Question:","1 X 11","Answer:","11"),new e("Question:","1 X 12","Answer:","12"),new e("Question:","2 X 1","Answer:","2"),new e("Question:","2 X 2","Answer:","4"),new e("Question:","2 X 3","Answer:","6"),new e("Question:","2 X 4","Answer:","8"),new e("Question:","2 X 5","Answer:","10"),new e("Question:","2 X 6","Answer:","12"),new e("Question:","2 X 7","Answer:","14"),new e("Question:","2 X 8","Answer:","16"),new e("Question:","2 X 9","Answer:","18"),new e("Question:","2 X 10","Answer:","20"),new e("Question:","2 X 11","Answer:","22"),new e("Question:","2 X 12","Answer:","24"),new e("Question:","3 X 1","Answer:","3"),new e("Question:","3 X 2","Answer:","6"),new e("Question:","3 X 3","Answer:","9"),new e("Question:","3 X 4","Answer:","12"),new e("Question:","3 X 5","Answer:","15"),new e("Question:","3 X 6","Answer:","18"),new e("Question:","3 X 7","Answer:","21"),new e("Question:","3 X 8","Answer:","24"),new e("Question:","3 X 9","Answer:","27"),new e("Question:","3 X 10","Answer:","30"),new e("Question:","3 X 11","Answer:","33"),new e("Question:","3 X 12","Answer:","36"),new e("Question:","4 X 1","Answer:","4"),new e("Question:","4 X 2","Answer:","8"),new e("Question:","4 X 3","Answer:","12"),new e("Question:","4 X 4","Answer:","16"),new e("Question:","4 X 5","Answer:","20"),new e("Question:","4 X 6","Answer:","24"),new e("Question:","4 X 7","Answer:","28"),new e("Question:","4 X 8","Answer:","32"),new e("Question:","4 X 9","Answer:","36"),new e("Question:","4 X 10","Answer:","40"),new e("Question:","4 X 11","Answer:","44"),new e("Question:","4 X 12","Answer:","48"),new e("Question:","5 X 1","Answer:","5"),new e("Question:","5 X 2","Answer:","10"),new e("Question:","5 X 3","Answer:","15"),new e("Question:","5 X 4","Answer:","20"),new e("Question:","5 X 5","Answer:","25"),new e("Question:","5 X 6","Answer:","30"),new e("Question:","5 X 7","Answer:","35"),new e("Question:","5 X 8","Answer:","40"),new e("Question:","5 X 9","Answer:","45"),new e("Question:","5 X 10","Answer:","50"),new e("Question:","5 X 11","Answer:","55"),new e("Question:","5 X 12","Answer:","60"),new e("Question:","6 X 1","Answer:","6"),new e("Question:","6 X 2","Answer:","12"),new e("Question:","6 X 3","Answer:","18"),new e("Question:","6 X 4","Answer:","24"),new e("Question:","6 X 5","Answer:","30"),new e("Question:","6 X 6","Answer:","36"),new e("Question:","6 X 7","Answer:","42"),new e("Question:","6 X 8","Answer:","48"),new e("Question:","6 X 9","Answer:","54"),new e("Question:","6 X 10","Answer:","60"),new e("Question:","6 X 11","Answer:","66"),new e("Question:","6 X 12","Answer:","72"),new e("Question:","7 X 1","Answer:","7"),new e("Question:","7 X 2","Answer:","14"),new e("Question:","7 X 3","Answer:","21"),new e("Question:","7 X 4","Answer:","28"),new e("Question:","7 X 5","Answer:","35"),new e("Question:","7 X 6","Answer:","42"),new e("Question:","7 X 7","Answer:","49"),new e("Question:","7 X 8","Answer:","56"),new e("Question:","7 X 9","Answer:","63"),new e("Question:","7 X 10","Answer:","70"),new e("Question:","7 X 11","Answer:","77"),new e("Question:","7 X 12","Answer:","84"),new e("Question:","8 X 1","Answer:","8"),new e("Question:","8 X 2","Answer:","16"),new e("Question:","8 X 3","Answer:","24"),new e("Question:","8 X 4","Answer:","32"),new e("Question:","8 X 5","Answer:","40"),new e("Question:","8 X 6","Answer:","48"),new e("Question:","8 X 7","Answer:","56"),new e("Question:","8 X 8","Answer:","64"),new e("Question:","8 X 9","Answer:","72"),new e("Question:","8 X 10","Answer:","80"),new e("Question:","8 X 11","Answer:","88"),new e("Question:","8 X 12","Answer:","96"),new e("Question:","9 X 1","Answer:","9"),new e("Question:","9 X 2","Answer:","18"),new e("Question:","9 X 3","Answer:","27"),new e("Question:","9 X 4","Answer:","36"),new e("Question:","9 X 5","Answer:","45"),new e("Question:","9 X 6","Answer:","54"),new e("Question:","9 X 7","Answer:","63"),new e("Question:","9 X 8","Answer:","72"),new e("Question:","9 X 9","Answer:","81"),new e("Question:","9 X 10","Answer:","90"),new e("Question:","9 X 11","Answer:","99"),new e("Question:","9 X 12","Answer:","108"),new e("Question:","10 X 1","Answer:","10"),new e("Question:","10 X 2","Answer:","20"),new e("Question:","10 X 3","Answer:","30"),new e("Question:","10 X 4","Answer:","40"),new e("Question:","10 X 5","Answer:","50"),new e("Question:","10 X 6","Answer:","60"),new e("Question:","10 X 7","Answer:","70"),new e("Question:","10 X 8","Answer:","80"),new e("Question:","10 X 9","Answer:","90"),new e("Question:","10 X 10","Answer:","100"),new e("Question:","10 X 11","Answer:","110"),new e("Question:","10 X 12","Answer:","120"),new e("Question:","11 X 1","Answer:","11"),new e("Question:","11 X 2","Answer:","22"),new e("Question:","11 X 3","Answer:","33"),new e("Question:","11 X 4","Answer:","44"),new e("Question:","11 X 5","Answer:","55"),new e("Question:","11 X 6","Answer:","66"),new e("Question:","11 X 7","Answer:","77"),new e("Question:","11 X 8","Answer:","88"),new e("Question:","11 X 9","Answer:","99"),new e("Question:","11 X 10","Answer:","110"),new e("Question:","11 X 11","Answer:","121"),new e("Question:","11 X 12","Answer:","132"),new e("Question:","12 X 1","Answer:","12"),new e("Question:","12 X 2","Answer:","24"),new e("Question:","12 X 3","Answer:","36"),new e("Question:","12 X 4","Answer:","48"),new e("Question:","12 X 5","Answer:","60"),new e("Question:","12 X 6","Answer:","72"),new e("Question:","12 X 7","Answer:","84"),new e("Question:","12 X 8","Answer:","96"),new e("Question:","12 X 9","Answer:","108"),new e("Question:","12 X 10","Answer:","120"),new e("Question:","12 X 11","Answer:","132"),new e("Question:","12 X 12","Answer:","144")];return{cards:n}});
define('mockData/statesAndCapitals',["models/card"],function(e){var n=[new e("State:","Alabama","Capital:","Montgomery"),new e("State:","Alaska","Capital:","Juneau"),new e("State:","Arizona","Capital:","Phoenix"),new e("State:","Arkansas","Capital:","Little Rock"),new e("State:","California","Capital:","Sacramento"),new e("State:","Colorado","Capital:","Denver"),new e("State:","Connecticut","Capital:","Hartford"),new e("State:","Delaware","Capital:","Dover"),new e("State:","Florida","Capital:","Tallahassee"),new e("State:","Georgia","Capital:","Atlanta"),new e("State:","Hawaii","Capital:","Honolulu"),new e("State:","Idaho","Capital:","Boise"),new e("State:","Illinois","Capital:","Springfield"),new e("State:","Indiana","Capital:","Indianapolis"),new e("State:","Iowa","Capital:","Des Moines"),new e("State:","Kansas","Capital:","Topeka"),new e("State:","Kentucky","Capital:","Frankfort"),new e("State:","Louisiana","Capital:","Baton Rouge"),new e("State:","Maine","Capital:","Augusta"),new e("State:","Maryland","Capital:","Annapolis"),new e("State:","Massachusetts","Capital:","Boston"),new e("State:","Michigan","Capital:","Lansing"),new e("State:","Minnesota","Capital:","St. Paul"),new e("State:","Mississippi","Capital:","Jackson"),new e("State:","Missouri","Capital:","Jefferson City"),new e("State:","Montana","Capital:","Helena"),new e("State:","Nebraska","Capital:","Lincoln"),new e("State:","Nevada","Capital:","Carson City"),new e("State:","New Hampshire","Capital:","Concord"),new e("State:","New Jersey","Capital:","Trenton"),new e("State:","New Mexico","Capital:","Santa Fe"),new e("State:","New York","Capital:","Albany"),new e("State:","North Carolina","Capital:","Raleigh"),new e("State:","North Dakota","Capital:","Bismarck"),new e("State:","Ohio","Capital:","Columbus"),new e("State:","Oklahoma","Capital:","Oklahoma City"),new e("State:","Oregon","Capital:","Salem"),new e("State:","Pennsylvania","Capital:","Harrisburg"),new e("State:","Rhode Island","Capital:","Providence"),new e("State:","South Carolina","Capital:","Columbia"),new e("State:","South Dakota","Capital:","Pierre"),new e("State:","Tennessee","Capital:","Nashville"),new e("State:","Texas","Capital:","Austin"),new e("State:","Utah","Capital:","Salt Lake City"),new e("State:","Vermont","Capital:","Montpelier"),new e("State:","Virginia","Capital:","Richmond"),new e("State:","Washington","Capital:","Olympia"),new e("State:","West Virginia","Capital:","Charleston"),new e("State:","Wisconsin","Capital:","Madison"),new e("State:","Wyoming","Capital:","Cheyenne")];return{cards:n}});
define('mockData/durandal',["models/card"],function(e){var n=[new e("True or False:","Durandal is a data access framework for JavaScript.","False:","Durandal is Single-Page Application framework."),new e("True or False:","Durandal has writen its own module loader.","False:","Durandal uses RequireJS as it module loader.")];return{cards:n}});
define('mockData/requirejs',["models/card"],function(e){var n=[new e("True or False:","RequireJS uses r.js to bundle and minify your AMD modules.","True",""),new e("True or False:","AMD stands for Asynchronous Module Definition.","True","")];return{cards:n}});
define('services/flashCardService',["durandal/system","mockData/multiplication","mockData/statesAndCapitals","mockData/durandal","mockData/requirejs"],function(e,n,t,s,a){var i={Multiplication:n.cards,"States and Capitals":t.cards,Durandal:s.cards,RequireJS:a.cards},r=[];for(var o in i)i.hasOwnProperty(o)&&r.push(o);var w={};return w.catalogNames=function(){return e.log("******** Getting catalog names"),e.defer(function(e){e.resolve(r)})},w.getCards=function(n){return e.log("******** Getting cards"),e.defer(function(e){i[n]?e.resolve(i[n]):e.reject()})},w});
define('models/random',["durandal/system"],function(e){var n=function(n){var s=t(0,n.length-1);return e.log("Random Index: "+s),s},t=function(e,n){return Math.floor(Math.random()*(n-e+1))+e};return{pickRandom:n,randomBetween:t}});
define('models/selectedCards',["durandal/app","durandal/system","plugins/observable","services/flashCardService","models/random"],function(e,n,t,s,a){var i={name:"",cards:[],card:{},index:0,found:!1,random:!1};return e.on("randomChanged").then(function(e){n.log("Random changed: "+e),i.random=e}),i.select=function(e){return s.getCards(e).done(function(n){i.found=!0,i.cards=n,i.name=e,i.index=0,i.card=i.cards[0]}).fail(function(){i.found=!1})},i.setIndex=function(e){return e=parseInt(e),0>e||e>i.cards.length-1?(i.found=!1,void 0):(i.index=e,i.card=i.cards[e],void 0)},i.nextIndex=function(){return i.random?a.pickRandom(i.cards):i.index<i.cards.length-1?i.index+1:i.cards.length-1},i.previousIndex=function(){return i.index<1?0:i.index-1},t.defineProperty(i,"hasNext",function(){return i.random?!0:i.index<i.cards.length-1}),t.defineProperty(i,"hasPrevious",function(){return i.random?!1:i.index>0}),t.defineProperty(i,"selectedOf",function(){return i.cards&&0!==i.cards.length?i.index+1+" of "+i.cards.length:""}),t.convertObject(i),i});
define('cards/card',["models/selectedCards"],function(e){var t={},n=0;return t.selected=e,t.activate=function(e,t){n=t},t.attached=function(){e.setIndex(n)},t.flip=function(){$(".card").toggleClass("flip")},t});
define('text!cards/index.html',[],function () { return '<div class="col-xs-offset-1 col-xs-10">\r\n   \r\n   <div data-bind="visible: selected.found === true">\r\n      <div class="row">\r\n         <button class="col-xs-4 col-sm-2 col-md-1 btn btn-default" \r\n                 data-bind="enable: selected.hasPrevious, click: previous">Previous</button>\r\n         <button class="col-xs-4 col-xs-offset-4 col-sm-2 col-sm-offset-8 col-md-1 col-md-offset-10 btn btn-default" \r\n                 data-bind="enable: selected.hasNext, click: next">Next</button>\r\n      </div>\r\n      \r\n      <div class="row status">\r\n         <span data-bind="text: selected.selectedOf"/>\r\n         <span class="selectedName" data-bind="text: selected.name"></span>\r\n      </div>\r\n\r\n      <div class="row" data-bind="router: { transition:\'entrance\'}"></div>\r\n      \r\n   </div>\r\n\r\n   <div data-bind="visible: selected.found === false">\r\n      <h2>Card not found.</h2>\r\n   </div>\r\n\r\n</div>\r\n';});

define('plugins/history',["durandal/system","jquery"],function(e,t){function n(e,t,n){if(n){var i=e.href.replace(/(javascript:|#).*$/,"");e.replace(i+"#"+t)}else e.hash="#"+t}var i=/^[#\/]|\s+$/g,a=/^\/+|\/+$/g,r=/msie [\w.]+/,o=/\/$/,s={interval:50,active:!1};return"undefined"!=typeof window&&(s.location=window.location,s.history=window.history),s.getHash=function(e){var t=(e||s).location.href.match(/#(.*)$/);return t?t[1]:""},s.getFragment=function(e,t){if(null==e)if(s._hasPushState||!s._wantsHashChange||t){e=s.location.pathname+s.location.search;var n=s.root.replace(o,"");e.indexOf(n)||(e=e.substr(n.length))}else e=s.getHash();return e.replace(i,"")},s.activate=function(n){s.active&&e.error("History has already been activated."),s.active=!0,s.options=e.extend({},{root:"/"},s.options,n),s.root=s.options.root,s._wantsHashChange=s.options.hashChange!==!1,s._wantsPushState=!!s.options.pushState,s._hasPushState=!!(s.options.pushState&&s.history&&s.history.pushState);var o=s.getFragment(),c=document.documentMode,u=r.exec(navigator.userAgent.toLowerCase())&&(!c||7>=c);s.root=("/"+s.root+"/").replace(a,"/"),u&&s._wantsHashChange&&(s.iframe=t('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,s.navigate(o,!1)),s._hasPushState?t(window).on("popstate",s.checkUrl):s._wantsHashChange&&"onhashchange"in window&&!u?t(window).on("hashchange",s.checkUrl):s._wantsHashChange&&(s._checkUrlInterval=setInterval(s.checkUrl,s.interval)),s.fragment=o;var l=s.location,d=l.pathname.replace(/[^\/]$/,"$&/")===s.root;if(s._wantsHashChange&&s._wantsPushState){if(!s._hasPushState&&!d)return s.fragment=s.getFragment(null,!0),s.location.replace(s.root+s.location.search+"#"+s.fragment),!0;s._hasPushState&&d&&l.hash&&(this.fragment=s.getHash().replace(i,""),this.history.replaceState({},document.title,s.root+s.fragment+l.search))}return s.options.silent?void 0:s.loadUrl()},s.deactivate=function(){t(window).off("popstate",s.checkUrl).off("hashchange",s.checkUrl),clearInterval(s._checkUrlInterval),s.active=!1},s.checkUrl=function(){var e=s.getFragment();return e===s.fragment&&s.iframe&&(e=s.getFragment(s.getHash(s.iframe))),e===s.fragment?!1:(s.iframe&&s.navigate(e,!1),s.loadUrl(),void 0)},s.loadUrl=function(e){var t=s.fragment=s.getFragment(e);return s.options.routeHandler?s.options.routeHandler(t):!1},s.navigate=function(t,i){if(!s.active)return!1;if(void 0===i?i={trigger:!0}:e.isBoolean(i)&&(i={trigger:i}),t=s.getFragment(t||""),s.fragment!==t){s.fragment=t;var a=s.root+t;if(""===t&&"/"!==a&&(a=a.slice(0,-1)),s._hasPushState)s.history[i.replace?"replaceState":"pushState"]({},document.title,a);else{if(!s._wantsHashChange)return s.location.assign(a);n(s.location,t,i.replace),s.iframe&&t!==s.getFragment(s.getHash(s.iframe))&&(i.replace||s.iframe.document.open().close(),n(s.iframe.location,t,i.replace))}return i.trigger?s.loadUrl(t):void 0}},s.navigateBack=function(){s.history.back()},s});
define('plugins/router',["durandal/system","durandal/app","durandal/activator","durandal/events","durandal/composition","plugins/history","knockout","jquery"],function(e,t,n,i,r,a,o,s){function u(e){return e=e.replace(h,"\\$&").replace(g,"(?:$1)?").replace(p,function(e,t){return t?e:"([^/]+)"}).replace(w,"(.*?)"),new RegExp("^"+e+"$")}function c(e){var t=e.indexOf(":"),n=t>0?t-1:e.length;return e.substring(0,n)}function l(e,t){return-1!==e.indexOf(t,e.length-t.length)}function d(e,t){if(!e||!t)return!1;if(e.length!=t.length)return!1;for(var n=0,i=e.length;i>n;n++)if(e[n]!=t[n])return!1;return!0}var f,v,g=/\((.*?)\)/g,p=/(\(\?)?:\w+/g,w=/\*\w+/g,h=/[\-{}\[\]+?.,\\\^$|#\s]/g,m=/\/$/,A=function(){function r(e){return e.router&&e.router.parent==R}function s(e){_&&_.config.isActive&&_.config.isActive(e)}function g(t,n){e.log("Navigation Complete",t,n);var i=e.getModuleId(k);i&&R.trigger("router:navigation:from:"+i),k=t,s(!1),_=n,s(!0);var a=e.getModuleId(k);a&&R.trigger("router:navigation:to:"+a),r(t)||R.updateDocumentTitle(t,n),v.explicitNavigation=!1,v.navigatingBack=!1,R.trigger("router:navigation:complete",t,n,R)}function p(t,n){e.log("Navigation Cancelled"),R.activeInstruction(_),_&&R.navigate(_.fragment,!1),N(!1),v.explicitNavigation=!1,v.navigatingBack=!1,R.trigger("router:navigation:cancelled",t,n,R)}function w(t){e.log("Navigation Redirecting"),N(!1),v.explicitNavigation=!1,v.navigatingBack=!1,R.navigate(t,{trigger:!0,replace:!0})}function h(t,n,i){v.navigatingBack=!v.explicitNavigation&&k!=i.fragment,R.trigger("router:route:activating",n,i,R),t.activateItem(n,i.params).then(function(e){if(e){var a=k;if(g(n,i),r(n)){var o=i.fragment;i.queryString&&(o+="?"+i.queryString),n.router.loadUrl(o)}a==n&&(R.attached(),R.compositionComplete())}else t.settings.lifecycleData&&t.settings.lifecycleData.redirect?w(t.settings.lifecycleData.redirect):p(n,i);f&&(f.resolve(),f=null)}).fail(function(t){e.error(t)})}function y(t,n,i){var r=R.guardRoute(n,i);r?r.then?r.then(function(r){r?e.isString(r)?w(r):h(t,n,i):p(n,i)}):e.isString(r)?w(r):h(t,n,i):p(n,i)}function b(e,t,n){R.guardRoute?y(e,t,n):h(e,t,n)}function S(e){return _&&_.config.moduleId==e.config.moduleId&&k&&(k.canReuseForRoute&&k.canReuseForRoute.apply(k,e.params)||!k.canReuseForRoute&&k.router&&k.router.loadUrl)}function Q(){if(!N()){var t=D.shift();D=[],t&&(N(!0),R.activeInstruction(t),S(t)?b(n.create(),k,t):e.acquire(t.config.moduleId).then(function(n){var i=e.resolveObject(n);b(O,i,t)}).fail(function(n){e.error("Failed to load routed module ("+t.config.moduleId+"). Details: "+n.message)}))}}function C(e){D.unshift(e),Q()}function X(e,t,n){for(var i=e.exec(t).slice(1),r=0;r<i.length;r++){var a=i[r];i[r]=a?decodeURIComponent(a):null}var o=R.parseQueryString(n);return o&&i.push(o),{params:i,queryParams:o}}function x(t){R.trigger("router:route:before-config",t,R),e.isRegExp(t)?t.routePattern=t.route:(t.title=t.title||R.convertRouteToTitle(t.route),t.moduleId=t.moduleId||R.convertRouteToModuleId(t.route),t.hash=t.hash||R.convertRouteToHash(t.route),t.routePattern=u(t.route)),t.isActive=t.isActive||o.observable(!1),R.trigger("router:route:after-config",t,R),R.routes.push(t),R.route(t.routePattern,function(e,n){var i=X(t.routePattern,e,n);C({fragment:e,queryString:n,config:t,params:i.params,queryParams:i.queryParams})})}function I(t){if(e.isArray(t.route))for(var n=t.isActive||o.observable(!1),i=0,r=t.route.length;r>i;i++){var a=e.extend({},t);a.route=t.route[i],a.isActive=n,i>0&&delete a.nav,x(a)}else x(t);return R}var k,_,D=[],N=o.observable(!1),O=n.create(),R={handlers:[],routes:[],navigationModel:o.observableArray([]),activeItem:O,isNavigating:o.computed(function(){var e=O(),t=N(),n=e&&e.router&&e.router!=R&&e.router.isNavigating()?!0:!1;return t||n}),activeInstruction:o.observable(null),__router__:!0};return i.includeIn(R),O.settings.areSameItem=function(e,t,n,i){return e==t?d(n,i):!1},R.parseQueryString=function(e){var t,n;if(!e)return null;if(n=e.split("&"),0==n.length)return null;t={};for(var i=0;i<n.length;i++){var r=n[i];if(""!==r){var a=r.split("=");t[a[0]]=a[1]&&decodeURIComponent(a[1].replace(/\+/g," "))}}return t},R.route=function(e,t){R.handlers.push({routePattern:e,callback:t})},R.loadUrl=function(t){var n=R.handlers,i=null,r=t,o=t.indexOf("?");if(-1!=o&&(r=t.substring(0,o),i=t.substr(o+1)),R.relativeToParentRouter){var s=this.parent.activeInstruction();r=s.params.join("/"),r&&"/"==r.charAt(0)&&(r=r.substr(1)),r||(r=""),r=r.replace("//","/").replace("//","/")}r=r.replace(m,"");for(var u=0;u<n.length;u++){var c=n[u];if(c.routePattern.test(r))return c.callback(r,i),!0}return e.log("Route Not Found"),R.trigger("router:route:not-found",t,R),_&&a.navigate(_.fragment,{trigger:!1,replace:!0}),v.explicitNavigation=!1,v.navigatingBack=!1,!1},R.updateDocumentTitle=function(e,n){n.config.title?document.title=t.title?n.config.title+" | "+t.title:n.config.title:t.title&&(document.title=t.title)},R.navigate=function(e,t){return e&&-1!=e.indexOf("://")?(window.location.href=e,!0):(v.explicitNavigation=!0,a.navigate(e,t))},R.navigateBack=function(){a.navigateBack()},R.attached=function(){R.trigger("router:navigation:attached",k,_,R)},R.compositionComplete=function(){N(!1),R.trigger("router:navigation:composition-complete",k,_,R),Q()},R.convertRouteToHash=function(e){if(R.relativeToParentRouter){var t=R.parent.activeInstruction(),n=t.config.hash+"/"+e;return a._hasPushState&&(n="/"+n),n=n.replace("//","/").replace("//","/")}return a._hasPushState?e:"#"+e},R.convertRouteToModuleId=function(e){return c(e)},R.convertRouteToTitle=function(e){var t=c(e);return t.substring(0,1).toUpperCase()+t.substring(1)},R.map=function(t,n){if(e.isArray(t)){for(var i=0;i<t.length;i++)R.map(t[i]);return R}return e.isString(t)||e.isRegExp(t)?(n?e.isString(n)&&(n={moduleId:n}):n={},n.route=t):n=t,I(n)},R.buildNavigationModel=function(t){for(var n=[],i=R.routes,r=t||100,a=0;a<i.length;a++){var o=i[a];o.nav&&(e.isNumber(o.nav)||(o.nav=++r),n.push(o))}return n.sort(function(e,t){return e.nav-t.nav}),R.navigationModel(n),R},R.mapUnknownRoutes=function(t,n){var i="*catchall",r=u(i);return R.route(r,function(o,s){var u=X(r,o,s),c={fragment:o,queryString:s,config:{route:i,routePattern:r},params:u.params,queryParams:u.queryParams};if(t)if(e.isString(t))c.config.moduleId=t,n&&a.navigate(n,{trigger:!1,replace:!0});else if(e.isFunction(t)){var l=t(c);if(l&&l.then)return l.then(function(){R.trigger("router:route:before-config",c.config,R),R.trigger("router:route:after-config",c.config,R),C(c)}),void 0}else c.config=t,c.config.route=i,c.config.routePattern=r;else c.config.moduleId=o;R.trigger("router:route:before-config",c.config,R),R.trigger("router:route:after-config",c.config,R),C(c)}),R},R.reset=function(){return _=k=void 0,R.handlers=[],R.routes=[],R.off(),delete R.options,R},R.makeRelative=function(t){return e.isString(t)&&(t={moduleId:t,route:t}),t.moduleId&&!l(t.moduleId,"/")&&(t.moduleId+="/"),t.route&&!l(t.route,"/")&&(t.route+="/"),t.fromParent&&(R.relativeToParentRouter=!0),R.on("router:route:before-config").then(function(e){t.moduleId&&(e.moduleId=t.moduleId+e.moduleId),t.route&&(e.route=""===e.route?t.route.substring(0,t.route.length-1):t.route+e.route)}),R},R.createChildRouter=function(){var e=A();return e.parent=R,e},R};return v=A(),v.explicitNavigation=!1,v.navigatingBack=!1,v.targetIsThisWindow=function(e){var t=s(e.target).attr("target");return!t||t===window.name||"_self"===t||"top"===t&&window===window.top?!0:!1},v.activate=function(t){return e.defer(function(n){if(f=n,v.options=e.extend({routeHandler:v.loadUrl},v.options,t),a.activate(v.options),a._hasPushState)for(var i=v.routes,r=i.length;r--;){var o=i[r];o.hash=o.hash.replace("#","")}s(document).delegate("a","click",function(e){if(a._hasPushState){if(!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&v.targetIsThisWindow(e)){var t=s(this).attr("href");null==t||"#"===t.charAt(0)||/^[a-z]+:/i.test(t)||(v.explicitNavigation=!0,e.preventDefault(),a.navigate(t))}}else v.explicitNavigation=!0}),a.options.silent&&f&&(f.resolve(),f=null)}).promise()},v.deactivate=function(){a.deactivate()},v.install=function(){o.bindingHandlers.router={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,i,a){var s=o.utils.unwrapObservable(t())||{};if(s.__router__)s={model:s.activeItem(),attached:s.attached,compositionComplete:s.compositionComplete,activate:!1};else{var u=o.utils.unwrapObservable(s.router||i.router)||v;s.model=u.activeItem(),s.attached=u.attached,s.compositionComplete=u.compositionComplete,s.activate=!1}r.compose(e,s,a)}},o.virtualElements.allowedBindings.router=!0},v});
define('cards/index',["durandal/system","plugins/router","models/selectedCards"],function(e,t,n){function a(a){var d="#cards/"+encodeURIComponent(n.name)+"/id/"+a;e.log(d),t.navigate(d)}var d={},i="";return d.selected=n,d.router=t.createChildRouter().makeRelative({moduleId:"cards",route:"cards/:param1"}).map([{route:["id(/:param2)",""],moduleId:"card",title:"Card",nav:!0}]).buildNavigationModel(),d.activate=function(t){e.log("******** activate for index"),i=t},d.binding=function(){return e.log("******** binding complete for index"),n.select(i)},d.previous=function(){n.hasPrevious&&a(n.previousIndex())},d.next=function(){n.hasNext&&a(n.nextIndex())},d});
requirejs.config({paths:{text:"../Scripts/text",durandal:"../Scripts/durandal",plugins:"../Scripts/durandal/plugins",transitions:"../Scripts/durandal/transitions"}}),define("jquery",[],function(){return jQuery}),define("knockout",ko),define('main',["durandal/system","durandal/app","durandal/viewLocator"],function(e,n,t){e.debug(!0),n.title="Flash Cards",n.configurePlugins({router:!0,dialog:!0,widget:!0,observable:!0}),n.start().then(function(){t.useConvention(),n.setRoot("viewmodels/shell","entrance")})});
define('viewmodels/about',{});
define('viewmodels/catalog',["services/flashCardService","plugins/router"],function(e,n){var t={};return t.catalogNames=[],t.activate=function(){return e.catalogNames().done(function(e){t.catalogNames=e})},t.goToCards=function(e){n.navigate("#cards/"+encodeURIComponent(e)+"/id/0")},t});
define('viewmodels/shell',["durandal/app","plugins/router"],function(e,n){return{router:n,activate:function(){return n.map([{route:["catalog",""],title:"Catalog",moduleId:"viewmodels/catalog",nav:!0},{route:"about",title:"About",moduleId:"viewmodels/about",nav:!0},{route:"cards/:param1*details",title:"Cards",moduleId:"cards/index",hash:"#cards",nav:!1}]).buildNavigationModel(),n.mapUnknownRoutes("viewmodels/catalog","#catalog"),n.activate()},randomChecked:!1,randomChanged:function(){return e.trigger("randomChanged",this.randomChecked),!0}}});
define('text!views/about.html',[],function () { return '<div class="jumbotron">\r\n   <h1>Flash Cards</h1>\r\n   <p>Built using Durandal 2.0.1 and Bootstrap 3</p>   \r\n</div>\r\n';});

define('text!views/catalog.html',[],function () { return '<section>\r\n   <ul class="list-inline" data-bind="foreach: catalogNames">\r\n      <li class="col-xs-12 col-sm-6 col-md-3" data-bind="click: $parent.goToCards">\r\n         <div class="well">\r\n            <p class="lead" data-bind="text: $data"></p>\r\n         </div>\r\n      </li>        \r\n    </ul>        \r\n</section>';});

define('text!views/shell.html',[],function () { return '<div>\r\n   <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">\r\n      <div class="container">\r\n         <div class="navbar-header">\r\n         <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\r\n            <span class="sr-only">Toggle navigation</span>\r\n            <span class="icon-bar"></span>\r\n            <span class="icon-bar"></span>\r\n            <span class="icon-bar"></span>\r\n         </button>\r\n         <a class="navbar-brand" data-bind="attr: { href: router.navigationModel()[0].hash }">\r\n            <i class="fa fa-book"></i><span>Flash Cards</span>\r\n         </a>\r\n      </div>   \r\n         <div class="navbar-collapse collapse">\r\n            <ul class="nav navbar-nav" data-bind="foreach: router.navigationModel">\r\n               <li data-bind="css: { active: isActive }">\r\n                  <a data-bind="attr: { href: hash }, html: title"></a>\r\n               </li>\r\n            </ul>\r\n            <ul class="nav navbar-nav navbar-right" data-bind="css: { active: router.isNavigating }">\r\n               <li>\r\n                  <div class="checkbox">\r\n                     <label>\r\n                        <input type="checkbox" data-bind="checked: randomChecked, click: randomChanged"/> Random\r\n                     </label>   \r\n                  </div>\r\n               </li>\r\n               <li class="loader" data-bind="css: { active: router.isNavigating }">\r\n                  <i class="fa fa-spinner fa-spin fa-2x active"></i>\r\n               </li>\r\n            </ul>\r\n         </div>\r\n      </div>\r\n   </div>\r\n\r\n    <div class="app-container container" data-bind="router: { cacheViews: false }"></div>\r\n</div>';});

define('plugins/dialog',["durandal/system","durandal/app","durandal/composition","durandal/activator","durandal/viewEngine","jquery","knockout"],function(e,t,n,i,a,r,o){function s(t){return e.defer(function(n){e.isString(t)?e.acquire(t).then(function(t){n.resolve(e.resolveObject(t))}).fail(function(n){e.error("Failed to load dialog module ("+t+"). Details: "+n.message)}):n.resolve(t)}).promise()}var u,c={},l=0,d=function(e,t,n){this.message=e,this.title=t||d.defaultTitle,this.options=n||d.defaultOptions};return d.prototype.selectOption=function(e){u.close(this,e)},d.prototype.getView=function(){return a.processMarkup(d.defaultViewMarkup)},d.setViewUrl=function(e){delete d.prototype.getView,d.prototype.viewUrl=e},d.defaultTitle=t.title||"Application",d.defaultOptions=["Ok"],d.defaultViewMarkup=['<div data-view="plugins/messageBox" class="modal-content modal-dialog">','<div class="modal-header">','<h3 data-bind="text: title"></h3>',"</div>",'<div class="modal-body">','<p data-bind="text: message"></p>',"</div>",'<div class="modal-footer" data-bind="foreach: options">','<button class="btn" data-bind="click: function () { $parent.selectOption($data); }, text: $data, css: { \'btn-primary\': $index() == 0, autofocus: $index() == 0 }"></button>',"</div>","</div>"].join("\n"),u={MessageBox:d,currentZIndex:1050,getNextZIndex:function(){return++this.currentZIndex},isOpen:function(){return l>0},getContext:function(e){return c[e||"default"]},addContext:function(e,t){t.name=e,c[e]=t;var n="show"+e.substr(0,1).toUpperCase()+e.substr(1);this[n]=function(t,n){return this.show(t,n,e)}},createCompositionSettings:function(e,t){var n={model:e,activate:!1,transition:!1};return t.attached&&(n.attached=t.attached),t.compositionComplete&&(n.compositionComplete=t.compositionComplete),n},getDialog:function(e){return e?e.__dialog__:void 0},close:function(e){var t=this.getDialog(e);if(t){var n=Array.prototype.slice.call(arguments,1);t.close.apply(t,n)}},show:function(t,a,r){var o=this,u=c[r||"default"];return e.defer(function(e){s(t).then(function(t){var r=i.create();r.activateItem(t,a).then(function(i){if(i){var a=t.__dialog__={owner:t,context:u,activator:r,close:function(){var n=arguments;r.deactivateItem(t,!0).then(function(i){i&&(l--,u.removeHost(a),delete t.__dialog__,0===n.length?e.resolve():1===n.length?e.resolve(n[0]):e.resolve.apply(e,n))})}};a.settings=o.createCompositionSettings(t,u),u.addHost(a),l++,n.compose(a.host,a.settings)}else e.resolve(!1)})})}).promise()},showMessage:function(t,n,i){return e.isString(this.MessageBox)?u.show(this.MessageBox,[t,n||d.defaultTitle,i||d.defaultOptions]):u.show(new this.MessageBox(t,n,i))},install:function(e){t.showDialog=function(e,t,n){return u.show(e,t,n)},t.showMessage=function(e,t,n){return u.showMessage(e,t,n)},e.messageBox&&(u.MessageBox=e.messageBox),e.messageBoxView&&(u.MessageBox.prototype.getView=function(){return e.messageBoxView})}},u.addContext("default",{blockoutOpacity:.2,removeDelay:200,addHost:function(e){var t=r("body"),n=r('<div class="modalBlockout"></div>').css({"z-index":u.getNextZIndex(),opacity:this.blockoutOpacity}).appendTo(t),i=r('<div class="modalHost"></div>').css({"z-index":u.getNextZIndex()}).appendTo(t);if(e.host=i.get(0),e.blockout=n.get(0),!u.isOpen()){e.oldBodyMarginRight=t.css("margin-right"),e.oldInlineMarginRight=t.get(0).style.marginRight;var a=r("html"),o=t.outerWidth(!0),s=a.scrollTop();r("html").css("overflow-y","hidden");var c=r("body").outerWidth(!0);t.css("margin-right",c-o+parseInt(e.oldBodyMarginRight,10)+"px"),a.scrollTop(s)}},removeHost:function(e){if(r(e.host).css("opacity",0),r(e.blockout).css("opacity",0),setTimeout(function(){o.removeNode(e.host),o.removeNode(e.blockout)},this.removeDelay),!u.isOpen()){var t=r("html"),n=t.scrollTop();t.css("overflow-y","").scrollTop(n),e.oldInlineMarginRight?r("body").css("margin-right",e.oldBodyMarginRight):r("body").css("margin-right","")}},attached:function(e){r(e).css("visibility","hidden")},compositionComplete:function(e,t,n){var i=u.getDialog(n.model),a=r(e),o=a.find("img").filter(function(){var e=r(this);return!(this.style.width&&this.style.height||e.attr("width")&&e.attr("height"))});a.data("predefinedWidth",a.get(0).style.width);var s=function(){setTimeout(function(){a.data("predefinedWidth")||a.css({width:""});var e=a.outerWidth(!1),t=a.outerHeight(!1),n=r(window).height(),o=Math.min(t,n);a.css({"margin-top":(-o/2).toString()+"px","margin-left":(-e/2).toString()+"px"}),a.data("predefinedWidth")||a.outerWidth(e),t>n?a.css("overflow-y","auto"):a.css("overflow-y",""),r(i.host).css("opacity",1),a.css("visibility","visible"),a.find(".autofocus").first().focus()},1)};s(),o.load(s),a.hasClass("autoclose")&&r(i.blockout).click(function(){i.close()})}}),u});
define('plugins/http',["jquery","knockout"],function(e,t){return{callbackParam:"callback",get:function(t,n){return e.ajax(t,{data:n})},jsonp:function(t,n,i){return-1==t.indexOf("=?")&&(i=i||this.callbackParam,t+=-1==t.indexOf("?")?"?":"&",t+=i+"=?"),e.ajax({url:t,dataType:"jsonp",data:n})},post:function(n,i){return e.ajax({url:n,data:t.toJSON(i),type:"POST",contentType:"application/json",dataType:"json"})}}});
define('plugins/serializer',["durandal/system"],function(e){return{typeAttribute:"type",space:void 0,replacer:function(e,t){if(e){var n=e[0];if("_"===n||"$"===n)return void 0}return t},serialize:function(t,n){return n=void 0===n?{}:n,(e.isString(n)||e.isNumber(n))&&(n={space:n}),JSON.stringify(t,n.replacer||this.replacer,n.space||this.space)},getTypeId:function(e){return e?e[this.typeAttribute]:void 0},typeMap:{},registerType:function(){var t=arguments[0];if(1==arguments.length){var n=t[this.typeAttribute]||e.getModuleId(t);this.typeMap[n]=t}else this.typeMap[t]=arguments[1]},reviver:function(e,t,n,i){var r=n(t);if(r){var a=i(r);if(a)return a.fromJSON?a.fromJSON(t):new a(t)}return t},deserialize:function(e,t){var n=this;t=t||{};var i=t.getTypeId||function(e){return n.getTypeId(e)},r=t.getConstructor||function(e){return n.typeMap[e]},a=t.reviver||function(e,t){return n.reviver(e,t,i,r)};return JSON.parse(e,a)}}});
define('plugins/widget',["durandal/system","durandal/composition","jquery","knockout"],function(e,t,n,i){function r(e,n){var r=i.utils.domData.get(e,u);r||(r={parts:t.cloneNodes(i.virtualElements.childNodes(e))},i.virtualElements.emptyNode(e),i.utils.domData.set(e,u,r)),n.parts=r.parts}var a={},o={},s=["model","view","kind"],u="durandal-widget-data",c={getSettings:function(t){var n=i.utils.unwrapObservable(t())||{};if(e.isString(n))return{kind:n};for(var r in n)n[r]=-1!=i.utils.arrayIndexOf(s,r)?i.utils.unwrapObservable(n[r]):n[r];return n},registerKind:function(e){i.bindingHandlers[e]={init:function(){return{controlsDescendantBindings:!0}},update:function(t,n,i,a,o){var s=c.getSettings(n);s.kind=e,r(t,s),c.create(t,s,o,!0)}},i.virtualElements.allowedBindings[e]=!0,t.composeBindings.push(e+":")},mapKind:function(e,t,n){t&&(o[e]=t),n&&(a[e]=n)},mapKindToModuleId:function(e){return a[e]||c.convertKindToModulePath(e)},convertKindToModulePath:function(e){return"widgets/"+e+"/viewmodel"},mapKindToViewId:function(e){return o[e]||c.convertKindToViewPath(e)},convertKindToViewPath:function(e){return"widgets/"+e+"/view"},createCompositionSettings:function(e,t){return t.model||(t.model=this.mapKindToModuleId(t.kind)),t.view||(t.view=this.mapKindToViewId(t.kind)),t.preserveContext=!0,t.activate=!0,t.activationData=t,t.mode="templated",t},create:function(e,n,i,r){r||(n=c.getSettings(function(){return n},e));var a=c.createCompositionSettings(e,n);t.compose(e,a,i)},install:function(e){if(e.bindingName=e.bindingName||"widget",e.kinds)for(var n=e.kinds,a=0;a<n.length;a++)c.registerKind(n[a]);i.bindingHandlers[e.bindingName]={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,i,a){var o=c.getSettings(t);r(e,o),c.create(e,o,a,!0)}},t.composeBindings.push(e.bindingName+":"),i.virtualElements.allowedBindings[e.bindingName]=!0}};return c});
define('transitions/entrance',["durandal/system","durandal/composition","jquery"],function(e,t,n){var i=100,r={marginRight:0,marginLeft:0,opacity:1},a={marginLeft:"",marginRight:"",opacity:"",display:""},o=function(t){return e.defer(function(e){function o(){e.resolve()}function s(){t.keepScrollPosition||n(document).scrollTop(0)}function u(){s(),t.triggerAttach();var e={marginLeft:l?"0":"20px",marginRight:l?"0":"-20px",opacity:0,display:"block"},i=n(t.child);i.css(e),i.animate(r,{duration:c,easing:"swing",always:function(){i.css(a),o()}})}if(t.child){var c=t.duration||500,l=!!t.fadeOnly;t.activeView?n(t.activeView).fadeOut({duration:i,always:u}):u()}else n(t.activeView).fadeOut(i,o)}).promise()};return o});
require(["main"]);
}());