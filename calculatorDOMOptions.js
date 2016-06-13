'use strict';

// объект с кнопками:
// Каждая кнопка имеет: 
// a) label - текст на кнопке
// b) classes - массив с классами, которые присваиваются каждой кнопке (для оформления и функционала)
// 				по умолчанию для оформления используются классы main, extended, (memory) 
// 				для функционала - классы operations, digit, memory, modifier, settings
// 				У кнопок с классом memory отдельного оформления в этой реализации нет
// с) value - функция, связанная с кнопкой, добавляется в прототип.
// 				! цифры этого свойства не имеют.

;(function(that){

const buttons = { // 9 основных, 4 расширенных, 10 цифр (+ точка), 5 память
	'correctError': {
		label: 'CE',
		value: Calc.prototype.correctError,
		classes: ['main', 'settings'],
	},
	'cancel': {
		label: 'C',
		value: Calc.prototype.cancel,
		classes: ['main', 'settings']
	},
	'deleteLastDigit': {
		label: '&#x232b;',
		value: Calc.prototype.deleteLastDigit,
		classes: ['main', 'settings'],
		key: 'Backspace'
	},
	'divide': {
		label: '&divide;',
		value: divide,
		classes: ['main', 'operation'],
		key: '/'
	},
	'multiply': {
		label: '&times;',
		value: multiply,
		classes: ['main', 'operation'],
		key: '*'
	},
	'substract': {
		label: '&minus;',
		value: substract,
		classes: ['main', 'operation'],
		key: '-'
	},
	'add': {
		label: '+',
		value: add,
		classes: ['main', 'operation'],
		key: '+'
	},
	'changeSign': {
		label: '&plusmn;',
		value: changeSign,
		classes: ['main', 'operation']
	},
	'result': {
		label: '=',
		value: Calc.prototype.result,
		classes: ['main', 'operation'],
		key: ['=', 'Enter']
	},
	'perCent': {
		label: '%',
		value: perCent,
		classes: ['extended', 'operation'],
		key: '%'
	},
	'sqrt': {
		label: '&radic;',
		value: sqrt,
		classes: ['extended', 'operation']
	},
	'powerTwo': {
		label: '&#x1D465;&#xb2;',
		value: powerTwo,
		classes: ['extended', 'operation']
	},
	'negativePow': {
		label: '&#x215f;&#x1D465;',
		value: negativePow,
		classes: ['extended', 'operation']
	},
	'1': {
		label: '1',
		classes: ['main', 'digit'],
		key: '1'
	},
	'2': {
		label: '2',
		classes: ['main', 'digit'],
		key: '2'
	},
	'3': {
		label: '3',
		classes: ['main', 'digit'],
		key: '3'
	},
	'4': {
		label: '4',
		classes: ['main', 'digit'],
		key: '4'
	},
	'5': {
		label: '5',
		classes: ['main', 'digit'],
		key: '5'
	},
	'6': {
		label: '6',
		classes: ['main', 'digit'],
		key: '6'
	},
	'7': {
		label: '7',
		classes: ['main', 'digit'],
		key: '7'
	},
	'8': {
		label: '8',
		classes: ['main', 'digit'],
		key: '8'
	},
	'9': {
		label: '9',
		classes: ['main', 'digit'],
		key: '9'
	},
	'0': {
		label: '0',
		classes: ['main', 'digit'],
		key: '0'
	},
	'decimalPoint': {
		label: '.',
		classes: ['main', 'digit'],
		key: '.'
	},
	'memoryClear': {
		label: 'MC',
		value: 'memoryClear',
		classes: ['memory inactive']
	},
	'memoryRecall': {
		label: 'MR',
		value: 'memoryRecall', //Calc.prototype.memoryRecall,
		classes: ['memory inactive']
	},
	'memoryAdd': {
		label: 'M+',
		value: add, // Calc.prototype.memoryAdd,
		classes: ['memory']
	},
	'memorySubstract': {
		label: 'M-',
		value: substract, //Calc.prototype.memorySubstract,
		classes: ['memory']
	},
	'memorySave': {
		label: 'MS',
		value: 'memorySave', // Calc.prototype.memorySave,
		classes: ['memory']
	}
}

// двухмерный массив, задает порядок кнопок в разметке:
// 1-ый уровень - ряды
// 2-ой уровень - кнопки в ряду

const buttonsOrder = [
	['memoryClear', 'memoryRecall', 'memoryAdd', 'memorySubstract', 'memorySave'],
	['perCent', 'sqrt', 'powerTwo', 'negativePow'],
	['correctError', 'cancel', 'deleteLastDigit', 'divide'],
	['7', '8', '9', 'multiply'],
	['4', '5', '6', 'substract'],
	['1', '2', '3', 'add'],
	['changeSign', '0', 'decimalPoint', 'result']
];

const buttonsMemoryPanel = ['memoryClear', 'memoryAdd', 'memorySubstract'];

// Функции, связанные с кнопками
// Все параметры должны быть именованными (т.е. работать через переданные параметры, а не через arguments)
// функция может возвращать:
// 	а) примитив (число).
// 	б) объект с методами toString (что отображается на экране в строке expressions) и valueOf (значение выражения)

// в функциях можно использовать this, например, для унарных операторов есть возможность прочитать второй оператор через
// this.intermediateResult (геттер)

// арифметические действия
function add(a, b) {
	return this.precision(+a + +b);
}

function substract(a, b) {
	return this.precision(a - b);
}

function multiply(a, b) {
	return this.precision(a * b);
}

function divide(a, b) {
	try {

		return this.precision(a / b);

	} catch (e) {
		throw e;
	}
}

function changeSign(a) {
	return {
		toString: function() {
			return `negate(${a})`;
		},
		valueOf: function() {
			return a * -1;
		}
	}
}

// дополнительные
function perCent(a) {
	let result = this.intermediateResult;
	if (result !== null) {
		return this.precision((result / 100 * a));
	} else {
		return 0;
	}
}

function sqrt(a) {
	try {

		let root = this.precision(Math.sqrt(a));

		return {
			toString: function() {
				return `&radic;(${a})`
			},
			valueOf: function() {
				return root;
			}
		}

	} catch (e) {
		throw e;
	}
}

function powerTwo(a) {
	let result = this.precision(a * a);
	return {
		toString: function() {
			return `sqr(${a})`
		},
		valueOf: function() {
			return result;
		}
	}
}

function negativePow(a) {
	return this.precision(1 / a);
}

that.calcOptions = {
	maxLength: 16,
	precision: 5,
	buttons: buttons,
	buttonsOrder: buttonsOrder,
	showMemoryPanel: false,
	buttonsMemoryPanel: buttonsMemoryPanel,
	showHistoryPanel: false
}

})(window);