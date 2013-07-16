class test{
	constructor(msg) {
		this.msg = msg;
	}

	greet() { return "lol" }
}

class Greeter extends test {
	static test(){ return super.test() + "test" }

	//static A = 123;

	constructor({message}) {
		super(message);
		this.greeting = message;
	}

	greet(a = 1, [b] = [2]) {
		return super.greet() + "Hello, " + this.msg	+ "|" + this.greeting + "|" + a + "|" + b;
	}
}

(new Greeter({message: "test"})).greet()
