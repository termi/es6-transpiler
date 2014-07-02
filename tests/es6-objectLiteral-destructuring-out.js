// About: objectLiteral's and destructuring transpiling

{// properties
    var A, B, C;
    var A$0 = 11, B$0 = 21, C$0 = 31;

    {
        var A$1 = (C$1 = ([{A: A$0, B: B$0, C: C$0}])[0]).A, B$1 = C$1.B, C$1 = C$1.C;
        console.log(A$1 === 11, B$1 === 21, C$1 === 31)
    }

}

{// properties & default values
    var A$2, B$2, C$2;
    var A$0$0 = 12, B$0$0 = 22, C$0$0 = 33;

    {
        var A$3 = ((A$3 = (C$3 = ([{A: A$0$0, B: B$0$0}])[0]).A) === void 0 ? 111 : A$3), B$3 = ((B$3 = C$3.B) === void 0 ? 222 : B$3), C$3 = ((C$3 = C$3.C) === void 0 ? 333 : C$3);
        console.log(A$3 === 12, B$3 === 22, C$3 === 333)
    }

}

// TODO::
//{// computed properties & arrow function & string template
//      let A, B, C;
//      let A$0 = 13, B$0 = 23, C$0 = 33;
//      let prop = "B";
//
//      {
//          let [{["A"]: A, [prop]: B, [(()=>"C")()]: C, [`${"D"}`]: D}] = [{A: A$0, B: B$0, C: C$0, D: C$0 + 10}];
//          console.log(A === 13, B === 23, C === 33, D === 43)
//      }
//
//}
//
//{// computed properties & default values & arrow function & string template
//      let A, B, C;
//      let A$0 = 14, B$0 = 24, C$0 = 34;
//
//      {
//          let [{["A"]: A = 111, [prop]: B = 222, [(()=>"C")()]: C = 333}, [`${"D"}`]: D = 444] = [{A: A$0, B: B$0, C: C$0}];
//          console.log(A === 14, B === 24, C === 34, D === 444)
//      }
//
//}
