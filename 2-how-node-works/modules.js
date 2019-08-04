// console.log(arguments);
// console.log(require('module').wrapper);

// module.exports
const Calculator = require('./test-module-1');
const a = new Calculator();
console.log(a.add(1, 3));

// exports
const calculator = require('./test-module-2');
console.log(calculator.add(2, 3));
console.log(calculator.multiply(2, 3));
console.log('======================');
const { add, multiply, devide } = require('./test-module-2');
console.log(add(3, 4));
console.log(multiply(2, 4));
console.log(devide(18, 2));

// Caching -> Hello called 1 time.
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();
