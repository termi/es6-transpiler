function test() {

	function test1() {var SLICE$0 = Array.prototype.slice;

		function test11() {
			var a = (c = [1, "2", '3'])[0], b = c[1], c = c[2];

			console.log(a === 1, b === "2", c === '3');
		}
		test11();

		function test12() {
			var a = (c = [1, "2", '3', 4])[0], b = c[1], c = SLICE$0.call(c, 2);

			console.log(a === 1, b === "2", c.join("|") === '3|4');
		}
		test12();

		function test13(arr) {
			var a = (arr[0]).a, b = (arr[1])[0], c = SLICE$0.call(arr, 2);

			console.log(a === 9, b === 8, c.join("") === '7654321');
		}
		test13([{a: 9}, [8], 7, 6, 5, 4, 3, 2, 1]);

	}
	test1();

}
test();
