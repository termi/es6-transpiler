class Greeter {
	static test(){ return "test" }

	//static A = 123;

	constructor(message) {
		this.greeting = message;
	}

	greet() {
		return "Hello, " + this.greeting;
	}
}

class Greeter1 extends Greeter {
	constructor(message) {
		super(message);
		this.greeting = message;
	}
	greet() {
		return super.greet() + "Hello, " + this.greeting;
	}
}

console.log(Greeter1.A);
console.log(Greeter1.test());
console.log((new Greeter1("test | ")).greet());
