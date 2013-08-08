let obj = {
	test: (function({a = 1} = {}){
		let d = 123, res;
		{
			let d = 888;
			let {a: h, b} = {a, b: ([c] = [...(([a])=>[a])([a + d]),1,2])}
			res = ([...b, h, d]);
		}
		return res.join("|") + "|" + d
	})()
}

console.log(obj.test === "889|1|2|1|888|123")

{
	let i = 0;
	let a = [];
	let b = [-2, -1, ...(a.push(i++),a), i, 0, ...(a.push(i++),a), i, 0, ...(a.push(i++),a), i, 0]
	//var b = [-2, -1].concat((a.push(i++), a), [i, 0], (a.push(i++), a), [i, 0], (a.push(i++), a), [i, 0])
	//var b = (  ( $__0 = [-2, -1] ).push.apply( $__0, (a.push(i++),a) ), $__0.push(i, 0), $__0.push.apply( $__0, (a.push(i++),a)), $__0.push(i, 0), $__0.push.apply( $__0, (a.push(i++),a)), $__0.push(i, 0), $__0 )
}

{
	let a = [1, 2, 3];
	let b =
		[0, ...a, 4, ...a.reverse()];// -> (($__0=[0, 4]).splice.bind($__0, 0, 0).apply(null, a == null ? false : a),$__0.splice.bind($__0, 0, 0).apply(null, a == null ? false : a))
}


{
	let a = [0, 1, ...[5, 6], 7, ...[8, 9]];// -> (($__0=[0, 1, null, null, 7, null, null]).splice(2, 2, 5, 6),$__0.splice(5, 2, 8, 9),$__0)
}