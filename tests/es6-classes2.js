class class1 {
	constructor(msg) {
		this.property1 = msg;
	}
	static sayStatic() { return "[static:class1]" }

	say() { return "class1:" + this.property1 }
}

class class2 extends class1 {
	static sayStatic(){ return super.sayStatic() + "[static:class2]" }

	//static A = 123;

	constructor({message}) {
		super(message);
		this.property2 = message;
	}

	say(a = 1, [b] = [2]) {
		return super.say() + "|class2" + ":" + this.property2 + "|" + a + "|" + b + ":" + class2.sayStatic();
	}
}

console.log((new class2({message: "test"})).say() === "class1:test|class2|test|1|2:[static:class1][static:class2]")
