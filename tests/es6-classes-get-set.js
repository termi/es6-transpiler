
class A {
	get a() {
		return this._a;
	}

	set a(val) {
		this._a = val + 3;
	}
};

class B extends A {
	get b() {
		return this._b;
	}

	m(){ }

	set b(val) {
		this._b = val + 2;
	}

	get c(){ return this._c }
	set 'c'(val){ this._c = val + 1 }
};

var test = new B;
test.a = 996;
test.b = 97;
test.c = 8;
console.log(test.a == 999, test.b == 99, test['c'] == 9)
