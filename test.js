var result = (defs = require("./main")).run({filename: "tests/allowed-loop-closures.js", fullES6: true})

console.log(result.src || result.errors.join("\n"))
