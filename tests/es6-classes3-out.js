var ASSIGN$0 = Object['assign']||function(t,s){for(var p in s){if(s.hasOwnProperty(p)){t[p]=s[p];}}return t};var class1 = (function(){function class1(msg){this.property1 = msg;};class1.sayStatic = function() { return "[static:class1]" };class1.prototype.say = function() { return "class1:" + this.property1 };return class1;})();

var super$0;

var class2 = (function(super$1){ASSIGN$0(class2, super$1);class2.sayStatic = function(){ return super$1.sayStatic() + "[static:class2]" };function class2(message) {var message = (message).message;super$0="test_super";super$1.call(this, message);this.property2 = message;}class2.prototype = Object.create(super$1.prototype, {"constructor": {"value": class2, "configurable": true, "writable": true, "enumerable": false} });;class2.prototype.say = function() {function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof v['@@iterator']==='function'){i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var a = arguments[0];if(a === void 0)a = [1];var b = arguments[1];if(b === void 0)b = [2];var arr = arguments[2];if(arr === void 0)arr = [].concat(ITER$0(a, true), ITER$0(b));return super$1.prototype.say.call(this) + "|arr:" + arr.join();};return class2;})(class1);

var class3 = (function(super$1){function class3() {super$1.apply(this, arguments)}ASSIGN$0(class3, super$1);class3.prototype = Object.create(super$1.prototype, {"constructor": {"value": class3, "configurable": true, "writable": true, "enumerable": false} });
    class3.prototype.say = function(){return "class3"}
;return class3;})(class1);


//console.log(class2.A === 123);
console.log((new class2({message: "test"})).say() === "class1:test|arr:1,2")
console.log((new class3()).say() === "class3")
console.log(super$0 === "test_super")
