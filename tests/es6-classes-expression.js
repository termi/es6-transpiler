
let secret = Object.create(null);

class A {
	m1() {
		return secret;
	}
}

{// anon class
	let v = new class extends A {
		static sMethod() {
			// can't call this method
		}
	};

	console.log(v.m1() === secret);
}

{// anon class2
	let secret2 = Object.create(null);

	let Class = (class extends A {
		static sMethod() {
			return secret2;
		}
	});
	let v = new Class;

	console.log(v.m1() === secret, Class.sMethod() === secret2);
}

{// named class
	let secret2 = Object.create(null);

	let v = new class B extends A {
		static sMethod() {
			return secret2;
		}
		test() {
			return B.sMethod();
		}
	};

	console.log(v.m1() === secret, v.test() === secret2);
}


{// named class 2
	let secret2 = Object.create(null);

	let Class = (class B extends A {
		static sMethod() {
			return secret2;
		}
		test() {
			return B.sMethod();
		}
	});
	let v = new Class;

	console.log(v.m1() === secret, Class.sMethod() === secret2, v.test() === secret2);
}
