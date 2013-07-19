// Esprima parser bug list

//{a} is ObjectExpression insteadof ObjectPattern
try {} catch({a}){  }
