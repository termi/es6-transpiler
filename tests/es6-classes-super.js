
var testCall = false;
class Foo {
	static doIt(test) {
		if ( test ) {
			testCall = true;
		}
		else {
			this.test = 999;
		}
	}
}

class Base extends Foo {
	constructor() {
		super();
		super.constructor();//useless call
		super.doIt(true);
		super.doIt.call(this);
	}
}

console.log( ((new Base).test === 999 && testCall) === true );
