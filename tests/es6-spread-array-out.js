function ITER$0(v,f){var $Symbol_iterator=typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof (f=v[$Symbol_iterator])==='function'){i=f.call(v);r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};{
	var a = [1].concat([2, 3], 4, [,,[5, 6]], [7]);
	console.log(a.join("|") == "1|2|3|4|||5,6|7");
}

{
	var a$0 = [].concat([parseInt("1qwe")], ITER$0((function(){var a = arguments[0];if(a === void 0)a = 2;var b = arguments[1];if(b === void 0)b = 3; return [a, b] })(), true), [4], 5);
	console.log(a$0.join("|") == "1|2|3|4|5");
}

{
	var b = [6, 7, 8];
	var a$1 = [1].concat([2, 3], 4, 5, [,,], ITER$0(b));
	console.log(a$1.join("|") == "1|2|3|4|5|||6|7|8");
}

{
	var g1 = "7", g2 = "8";
	var a$2 = [("0", false, "1") | 0, +"2"].concat([(false, "3")], [+parseFloat("4.5float"), (true ? "5" : 0)], [6, g1, g1 && g2]);
	console.log(a$2.join("|") == "1|2|3|4.5|5|6|7|8");
}

{
	var a$3 = [1].concat([].concat([2, 3].concat([(1 ? 4 : 0), (5)])));
	console.log(a$3.join("|") == "1|2|3|4|5");
}

{
	var a$4 =  [].concat([].concat([].concat([]))) ;
	console.log(a$4.join("|") == "");
}