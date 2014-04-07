( x+15 if(x%2==0) for(x of [ x for(x of "123456789") ] ) )

( for(x of [ for(x of "123456789") x ] ) if(x%2==0) x )
( for(x of "123456789") if(x%2==0) x )
{
	"type": "GeneratorComprehensionExpression",
	"filter": {
		"type": "BinaryExpression",
		"operator": "==",
		"left": {
			"type": "BinaryExpression",
			"operator": "%",
			"left": {
				"type": "Identifier",
				"name": "x"
			},
			"right": {
				"type": "Literal",
				"value": 2,
				"raw": "2"
			}
		},
		"right": {
			"type": "Literal",
			"value": 0,
			"raw": "0"
		}
	},
	"blocks": [
		{
			"type": "ComprehensionBlock",
			"left": {
				"type": "Identifier",
				"name": "x"
			},
			"right": {
				"type": "Literal",
				"value": "123456789",
				"raw": "\"123456789\""
			},
			"of": true
		}
	],
	"body": {
		"type": "Identifier",
		"name": "x"
	}
}

[ for(x = 0 ; x < 9 ;x ++) x ]

function throwOn4(x) {
  if(x==4)throw new Error(' x is 4 !!!!');
  return x;
}
function *f_gen() { for( let x of "123456789".split("") ){ yield throwOn4(x) } };let gen = f_gen();
function *f_gen() { var arr="123456789".split("");for( var i=0;i<arr.length;i++ ){ x=arr[i];yield throwOn4(x) } };let gen = f_gen();
let gen = ( for(x of "123456789".split("")) throwOn4(x) )

var a = ( for(x of [ for(x of "123456789".split("")) x ] ) if(x%2==0) {x + 1} );
[ for(x of a) x ].forEach(function(x){ console.log(x) })


function throwOn4(x) {
  if(x==4)throw new Error(' x is 4 !!!!');
  return x;
}
var gen = (function(){function $GET_ITER$0(a){ return a };var $GeneratorObject$0 = $GET_ITER$0;
	var x;
	var $inited$0 = false, $iterable$0, $iterator$0, $stop$0, $done$0 = false;
	return new $GeneratorObject$0({
		next: function() {
			if(!$inited$0) {
				if ($done$0 === true) {
					//throw new Error('"next" on closed generator');
					return {done: $done$0, value: void 0};
				}
				$iterable$0 = "123456789".split("");
				$iterable$0 = $GET_ITER$0($iterable$0);
				$iterator$0 = 0;
				$stop$0 = $iterable$0.length;
				$inited$0 = true;
			}
			$done$0 = !($iterator$0 < $stop$0)
			
			if ( !$done$0 ) {
				x = $iterable$0[$iterator$0++];
				if( !(x % 2==0) ) {x = void 0;
					return this.next();
				}				
				try {
					x = throwOn4(x);
				}
				catch(e) {
					$done$0 = true;
					x = $inited$0 = $iterable$0 = $iterator$0 = $stop$0 = void 0;
					throw e;
				}
			}
			else {
				$inited$0 = $iterable$0 = $iterator$0 = $stop$0 = void 0;
			}
			var $value$0 = x;x = void 0;
			return {done: $done$0, value: $value$0};
		}
	});
})()


function *gen() {
	let ololo = {obj: Math.random()};
	
	yield ololo;
	yield ololo;
}
var g = gen();debugger;g.next()

function gen() {var x;var $inited$0 = false, $iterable$0, $iterator$0, $stop$0, $done$0 = false;
	return {
		next: function() {
			if(!$inited$0) {
				if ($done$0 === true) {
					//throw new Error('"next" on closed generator');
					return {done: $done$0, value: void 0};
				}
				$iterable$0 = "123456789".split("");
				$iterable$0 = $GET_ITER$0($iterable$0);
				$iterator$0 = 0;
				$stop$0 = $iterable$0.length;
				$inited$0 = true;
			}
		}
	}


	let ololo = {obj: Math.random()};
	
	yield ololo;
	yield ololo;
}
var g = gen();debugger;g.next()