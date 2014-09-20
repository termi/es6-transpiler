var MD$0;var MD$1;var MD$2;require('spam');
var assert = require('assert');
MD$0 = require('foo');
var bar = MD$0;
MD$1 = require('basket');
var eggs = MD$1.eggs;
MD$2 = require('functions');
var fn1 = MD$2.fn1;
var fn2 = MD$2.fn2;
var Function1 = MD$2.fn1;

var foo = module.exports.foo = 1;
var Bob = (function(){"use strict";var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};function Bob() {}DP$0(Bob,"prototype",{"configurable":false,"enumerable":false,"writable":false});;return Bob;})();
module.exports.Bob = Bob;;
module.exports.Bob = Bob;

module.exports = foo;
