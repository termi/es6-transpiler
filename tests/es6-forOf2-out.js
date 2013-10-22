function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['iterator']==='function')return v['iterator']();}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;

var output = [];
var i = 0;
{
	var arr,f;
}

{
	var arr$0,f$0;
}

{
	var arr$1 = [1, 2, 3];
	$D$0 = GET_ITER$0(arr$1);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? arr$1.length : void 0);for(var f$1 ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){f$1 = ($D$1 ? arr$1[$D$0++] : $D$2["value"]);
		output.push(f$1);
	};$D$0 = $D$1 = $D$2 = void 0;;
	console.log(output.join("|") === "1|2|3")
}


{
	var arr$2 = [1, 2, 3];
	$D$3 = (arr$2.push(i++), arr$2.push(i++), arr$2.push(i++), arr$2);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(var f$2 ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){f$2 = ($D$1 ? $D$3[$D$0++] : $D$2["value"]);
		output.push(f$2);
	};$D$0 = $D$1 = $D$2 = $D$3 = void 0;;
	console.log(output.join("|") === "1|2|3|1|2|3|0|1|2")
}

{
	var arr$3,f$3;
}

