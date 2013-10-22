function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['iterator']==='function')return v['iterator']();}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;var $D$4;var $D$5;var $D$6;var $D$7;var $D$8;var $D$9;var $D$10;var $D$11;
var output;
{
	output = [];
	var arr = [1, 2, 3]
	$D$0 = GET_ITER$0(arr);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? arr.length : void 0);for(var f ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){f = ($D$1 ? arr[$D$0++] : $D$2["value"]);
		output.push(f)
	};$D$0 = $D$1 = $D$2 = void 0;
	console.log(output.join("|") === arr.join("|"))
}

{output = [];
	$D$3 = ([1, 2, 3]);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(var f$0 ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){f$0 = ($D$1 ? $D$3[$D$0++] : $D$2["value"]);
		output.push(f$0)
	};$D$0 = $D$1 = $D$2 = $D$3 = void 0;
	console.log(output.join("|") === [1, 2, 3].join("|"))}

{
	output = [];$D$3 = (( function(x) {return [x + 1, x + 2, x + 3]})(1));$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(var test ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){test = ($D$1 ? $D$3[$D$0++] : $D$2["value"]);
		output.push(test)
	};$D$0 = $D$1 = $D$2 = $D$3 = void 0;;console.log(output.join("|") === [2, 3, 4].join("|"))
}

{
	var output$0 = [];
	var arr$0 = [], i = 100;
	$D$3 = (arr$0.push(i++), arr$0.push(i++), arr$0.push(i++), arr$0);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(var f$1 ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){f$1 = ($D$1 ? $D$3[$D$0++] : $D$2["value"]);(function(f){
		output$0.push(function() {
			return f;
		})
	}).call(this, f$1);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;;
	console.log(output$0.map(function(v){return v()}).join("|") === arr$0.join("|"))
}

{
	output = [];
	var arr$1 = [], i$0 = 100;
	$D$3 = (arr$1.push(i$0++), arr$1.push(i$0++), arr$1.push(i$0++), arr$1);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(var f$2 ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){f$2 = ($D$1 ? $D$3[$D$0++] : $D$2["value"]);(function(f){
		output.push(function() {
			return f;
		})
	}).call(this, f$2);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;;
	console.log(output.map(function(v){return v()}).join("|") === arr$1.join("|"))
}

{
	output = [];
	$D$3 = (["a", "b", "c"]);$D$0 = GET_ITER$0($D$3);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? $D$3.length : void 0);for(var a ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0["next"]())["done"]; ){a = ($D$1 ? $D$3[$D$0++] : $D$2["value"]);
		$D$7 = ([1, 2, 3]);$D$4 = GET_ITER$0($D$7);$D$5 = $D$4 === 0;$D$6 = ($D$5 ? $D$7.length : void 0);for(var b = void 0 ; $D$5 ? ($D$4 < $D$6) : !($D$6 = $D$4["next"]())["done"]; ){b = ($D$5 ? $D$7[$D$4++] : $D$6["value"]);
			$D$11 = (["-", "=", "/"]);$D$8 = GET_ITER$0($D$11);$D$9 = $D$8 === 0;$D$10 = ($D$9 ? $D$11.length : void 0);for(var c = void 0 ; $D$9 ? ($D$8 < $D$10) : !($D$10 = $D$8["next"]())["done"]; ){c = ($D$9 ? $D$11[$D$8++] : $D$10["value"]);
				output.push(a + b + c);
			};$D$8 = $D$9 = $D$10 = $D$11 = void 0;;
		};$D$4 = $D$5 = $D$6 = $D$7 = void 0;;
	};$D$0 = $D$1 = $D$2 = $D$3 = void 0;;
	console.log(output.join("|") === "a1-|a1=|a1/|a2-|a2=|a2/|a3-|a3=|a3/|b1-|b1=|b1/|b2-|b2=|b2/|b3-|b3=|b3/|c1-|c1=|c1/|c2-|c2=|c2/|c3-|c3=|c3/")
}

