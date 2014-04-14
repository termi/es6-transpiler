var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function')return f.call(v);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;
var output = [];
var i = 0;
{
	var arr = [{a: 1}, {a: 2}, {a: 3}, {a: 4}, {b: 999}];
	var output$0 = [];

	var f;$D$0 = GET_ITER$0(arr);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? arr.length : void 0);for(  ; $D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"]; )
{;f = ((f = ($D$2 ? arr[$D$0++] : $D$1["value"]).a) === void 0 ? 9 : f);1,output$0.push(f),2

	};$D$0 = $D$1 = $D$2 = void 0;console.log(output$0.join("|") === [1, 2, 3, 4, 9].join("|"))
}

{
	var arr$0,f$0;
}

{
	var arr$1 = [1, 2, 3];
	$D$0 = GET_ITER$0(arr$1);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? arr$1.length : void 0);for(var f$1 ; $D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"]; ){f$1 = ($D$2 ? arr$1[$D$0++] : $D$1["value"]);
		output.push(f$1);
	};$D$0 = $D$1 = $D$2 = void 0;;
	console.log(output.join("|") === "1|2|3")
}


{
	var arr$2 = [1, 2, 3];
	$D$3 = (arr$2.push(i++), arr$2.push(i++), arr$2.push(i++), arr$2);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for(var f$2 ; $D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"]; ){f$2 = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);
		output.push(f$2);
	};$D$0 = $D$1 = $D$2 = $D$3 = void 0;;
	console.log(output.join("|") === "1|2|3|1|2|3|0|1|2")
}

{
	var arr$3,f$3;
}