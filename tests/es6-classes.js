class Greeter {
	static test(){ return "test" }

	//static A = 123;

	constructor(message) {
		this.greeting = message;
	}

	greet() {
		return "Hello 1, " + this.greeting;
	}
}

class Greeter1 extends Greeter {
	constructor(message) {
		super(message);
		this.greeting = message;
	}
	greet() {
		return super.greet() + "Hello 2, " + this.greeting;
	}
}

class A {

}

//console.log(Greeter.A === 123);
//console.log(Greeter1.A === 123);
console.log(Greeter1.test() === "test");
console.log((new Greeter1("test | 3")).greet() === "Hello 1, test | 3Hello 2, test | 3");
console.log(new A instanceof A);
