var $D$0;var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){i=f.call(v);r=[];}else if((v+'')==='[object Generator]'){i=v;r=[];};if(r) {while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};var BIND$0 = Function.prototype.bind;
var result = 0;
var a = {b: {c: function(a, b){ result += (a + b) }}}, args = [1, 2]
;($D$0 = a.b).c.apply($D$0, ITER$0(args))
new (BIND$0.apply(a.b.c, [null].concat(ITER$0(args))))()

console.log(result === 6);$D$0 = void 0;