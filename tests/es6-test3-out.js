function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof v['@@iterator']==='function'){i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var result = ((function(){var SLICE$0 = Array.prototype.slice;var r = SLICE$0.call(arguments, 0);var b = ((  function()    {var args = SLICE$0.call(arguments, 0);return {b: args[1]}} ).apply(null, ITER$0(r))).b;//destructuring / rest / spread
    return b;
})).apply(null, ITER$0([1, 2, 3]));

console.log(result === 2);

/*
 Test note:
 ! this test should be in a first line  !
 ! completed test: do not edit it       !
*/
