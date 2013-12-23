function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};var b = ((function(){var SLICE$0 = Array.prototype.slice;var args = SLICE$0.call(arguments, 0);return {b: args[1]}} ).apply(null, ITER$0([,1]))).b;//destructuring / rest / spread

console.log(b === 1);

/*
Test note:
 ! this test should be in a first line  !
 ! completed test: do not edit it       !
*/
