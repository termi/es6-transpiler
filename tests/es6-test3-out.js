var result = ((function(){var ARRAY$0 = Array;var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){i=f.call(v);r=[];}else if((v+'')==='[object Generator]'){i=v;r=[];};if(S_MARK$0)S_MARK$0(void 0);if(r) {while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};for (var l$0 = arguments.length, r = ARRAY$0(l$0), i$0 = 0; i$0 < l$0; i$0++) r[i$0] = arguments[i$0];var b = ((  function()    {for (var l$1 = arguments.length, args = ARRAY$0(l$1), i$1 = 0; i$1 < l$1; i$1++) args[i$1] = arguments[i$1];return {b: args[1]}} ).apply(null, ITER$0(r)).b);//destructuring / rest / spread
	return b;
})).apply(null, [1, 2, 3]);

console.log(result === 2);

/*
 Test note:
 ! this test should be in a first line  !
 ! completed test: do not edit it       !
*/
