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

const buttons = { // 9 основных, 4 расширенных, 10 цифр (+ точка), 5 память
	'correctError': {
		label: 'CE',
		value: correctError,
		classes: ['main', 'settings']
	},
	'cancel': {
		label: 'C',
		value: cancel,
		classes: ['main', 'settings']
	},
	'deleteLastDigit': {
		label: '&#x232b;',
		value: deleteLastDigit,
		classes: ['main', 'settings']
	},
	'divide': {
		label: '&divide;',
		value: divide,
		classes: ['main', 'operation']
	},
	'multiply': {
		label: '&times;',
		value: multiply,
		classes: ['main', 'operation']
	},
	'substract': {
		label: '&minus;',
		value: substract,
		classes: ['main', 'operation']
	},
	'add': {
		label: '+',
		value: add,
		classes: ['main', 'operation']
	},
	'changeSign': {
		label: '&plusmn;',
		value: changeSign,
		classes: ['main', 'operation']
	},
	'result': {
		label: '=',
		value: result,
		classes: ['main', 'operation']
	},
	'perCent': {
		label: '%',
		value: perCent,
		classes: ['extended', 'operation']
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
		classes: ['main', 'digit']
	},
	'2': {
		label: '2',
		classes: ['main', 'digit']
	},
	'3': {
		label: '3',
		classes: ['main', 'digit']
	},
	'4': {
		label: '4',
		classes: ['main', 'digit']
	},
	'5': {
		label: '5',
		classes: ['main', 'digit']
	},
	'6': {
		label: '6',
		classes: ['main', 'digit']
	},
	'7': {
		label: '7',
		classes: ['main', 'digit']
	},
	'8': {
		label: '8',
		classes: ['main', 'digit']
	},
	'9': {
		label: '9',
		classes: ['main', 'digit']
	},
	'0': {
		label: '0',
		classes: ['main', 'digit']
	},
	'decimalPoint': {
		label: '.',
		classes: ['main', 'digit']
	},
	'memoryClear': {
		label: 'MC',
		value: memoryClear,
		classes: ['memory']
	},
	'memoryRecall': {
		label: 'MR',
		value: memoryRecall,
		classes: ['memory']
	},
	'memoryAdd': {
		label: 'M+',
		value: memoryAdd,
		classes: ['memory']
	},
	'memorySubstract': {
		label: 'M-',
		value: memorySubstract,
		classes: ['memory']
	},
	'memorySave': {
		label: 'MS',
		value: memorySave,
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

// Функции, связанные с кнопками
// Все параметры должны быть именованными (т.е. работать через переданные параметры, а не через arguments)
// функция может возвращать:
// 	а) примитив (число).
// 	б) объект с методами toString (что отображается на экране в строке expressions) и valueOf (значение выражения)
// 	При ошибке выбрасывается исключение

// арифметические действия
function add(a, b) {
	return a + b;
}

function substract(a, b) {
	return a - b;
}

function multiply(a, b) {
	return a * b;
}

function divide() {
	try {

		return a / b;

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
function perCent(a, b) {
	return (a / 100 * b);
}

function sqrt(a) {
	try {

		let root = Math.sqrt(a);

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
	return a * a;
}

function negativePow(a) {
	return 1 / a;
}

// исправление ошибок
function correctError(a) {
	return 0;
}

// фактически - сигнал, сбросить все на ноль
// в отличие от '=' сбрасывает текущее выражение и всегда возвращает 0
function cancel() {
	this._operand = '';
	this._result = '0';
	this._expressionDisplay.innerHTML = '';
	this.displayResult();
}

function deleteLastDigit() {

	if (this._lastButton && !this._lastButton.classList.contains('digit')) {
		return;
	}

	if (this._result.length > 1) {
		this._result = this._result.slice(0, -1);

	} else {
		this._result = 0;
	}

	this.displayResult();
}

function result(a) {
	// если второй аргумент и действие заданы
	// if (this._operand && this._actionCurrent) {
	// 	this._result = this.calculate(this._actionCurrent, +a, +b);
	// 	this.displayExpressionString(this._buttons[action.name].label);
	// } else {

	// }

	// 		this.displayResult();


}

//работа с памятью
function memoryClear() {}

function memoryRecall() {}

function memoryAdd() {}

function memorySubstract() {}

function memorySave() {}

// класс DOM-калькулятора
class Calc {
	constructor(buttons, buttonsOrder) {
		// создаем калькулятор
		this._calc = Calc.render(buttons, buttonsOrder);
		// левый и правый операнды арифметических действий
		this._result = '0';
		this._operand = '';
		// действия, которые необходимо произвести над операторами:
		// current - между текущими операторами, next - между результатом current и следующим
		this._actionCurrent = null;
		this._actionNext = null;

		// элемент, отображающий текущий результат и выражение
		this._resultDisplay = null;
		this._expressionDisplay = null;
		// массив, содержащий строку
		this._expressionString = [];

		// служебный флаг, для удобства отслеживания, был ли напечатан результат выражения с одним операндом
		this._argPrinted = false;
		// последняя нажатая клавиша (учитываем только цифры и операции)
		this._lastButton = null;

		this._buttons = buttons; // с массивом будет работать удобнее, чем с DOM, поэтому сохраняем
		this._initialize(buttons);
	}

	static render(buttons, buttonsOrder) {
		let calc = document.createElement('div');
		let calcHTML = `<div class='calc'>
					      	<div class='calc-title'>Standard</div>
      						<div class="calc-display clearfix">
        					<div class="calc-expression clearfix"><span></span></div>
        					<div class="calc-current clearfix"><span></span></div>
      					</div>
      					<div class="calc-buttons-board clearfix">`;

		let buttonsHTML = '';

		buttonsOrder.forEach(function(row) {
			row.forEach(function(button) {
				buttonsHTML += `<button value="${button}" class="calc-button ${buttons[button].classes.join(' ')}">${buttons[button].label}</button>`;
			})
		});

		calcHTML += (buttonsHTML + '</div></div>');

		calc.innerHTML = calcHTML;

		return calc;
	}

	// добавляет обработчики действий по нажатиям на кнопки в прототип
	// добавляет обработчики событий на элемент this._calc: все обработчики вешаются на элемент, чтобы не зависить
	// от его верстки в будущем
	_initialize(buttons) {

		setPrototype(buttons);
		addEventHandlers.call(this);

		// инициализируем элементы, выводящие результат
		this._resultDisplay = this._calc.querySelector('.calc-current');
		// пишем в самый внутренний элемент (span в нашем случае)
		while (this._resultDisplay.firstElementChild) {
			this._resultDisplay = this._resultDisplay.firstElementChild;
		}
		this._expressionDisplay = this._calc.querySelector('.calc-expression');
		// пишем в самый внутренний элемент (span в нашем случае)
		while (this._expressionDisplay.firstElementChild) {
			this._expressionDisplay = this._expressionDisplay.firstElementChild;
		}

		// отображаем значение по умолчанию (0);
		this.displayResult();

		// Функции
		function setPrototype(buttons) {
			for (let button in buttons) {
				// отсеиваем цифры, остальное добавляем в прототип (если соответствующего действия уже там нет)
				if (buttons[button].hasOwnProperty('value') && !(buttons[button].value in Calc.prototype)) {
					Calc.prototype[button] = buttons[button].value;
				}
			}
		}

		function addEventHandlers() {
			let calc = this._calc;

			if (calc) {
				calc.addEventListener('click', this._onUserClick.bind(this));
				calc.addEventListener('DOMKeyPressed', this._onDOMKeyPressed.bind(this));
			}
		}
	}

	// обработчики событий
	/*
	Пользователь может нажать на кнопку мышкой, либо может использовать клавиатуру
	Функция _onUserClick обрабатывает действие пользователя и создает для обоих действий
	одинаковое событие onDOMKeyPressed с информацией о том, какая клавиша нажата и какое действие
	нужно выполнить 
	 */
	_onUserClick(e) {
		// клик мышью
		if (e.type === 'click') {
			let button = e.target.closest('.calc-button');

			if (!button) {
				return;
			}

			let action = null;
			let type = null;
			let value = null;

			if (button.classList.contains('operation')) {
				this._lastButton = button;
				action = this._buttons[button.value].value;
				type = 'operation';

			} else if (button.classList.contains('digit')) { // если нажата цифра
				this._lastButton = button;

				value = this._buttons[button.value].label;
				type = 'digit';

			} else if (button.classList.contains('settings')) {
				action = this._buttons[button.value].value;
				type = 'settings';
			}

			var event = new CustomEvent('DOMKeyPressed', {
				detail: {
					'action': action,
					'type': type,
					'value': value
				}
			})
			this._calc.dispatchEvent(event);
		}
	}

	_onDOMKeyPressed(e) {
		this.evaluate(e.detail.type, e.detail.value, e.detail.action);
	}

	// методы объекта
	getElem() {
		return this._calc;
	};

	// получает информацию о том, какая клавиша нажата, соответствующим образом
	// устанавливает свойства объекта Калькулятора, при необходимости запускает вычисления


	evaluate(type, value, action) {
		// если нажата цифра - устанавливаем операторы
		if (type === 'digit') {
			this.setOperands(value);

			// если выбрано арифметическое действие - вычисляем
		} else if (type === 'operation') {
			this.setAction(action);

		} else if (type === 'settings') {
			action.call(this);
		}
	}

	/*
	Операнды хранятся в строковом виде. Операнд может быть не строкой, а числом/объектом только в том случае,
	если над ним было произведено арифметическое действие-модификатор (корень, степень), т.е. действие, не требующее
	второго оператора.
	В случае, если над левым оператором было произведено такое действие, а следующая нажатая клавиша - число (т.е, например, 
	нажата последовательность клавиш: 9 - корень - 5), предыдущий левый оператор записывается в память, и устанавливается новый
	левый оператор. Если такое действие было произведено над правым оператором, значение в правом операторе уничтожается и устанавливается
	новый правый оператор
	 */
	setOperands(value) {

		// если еще не было задано действия, а значит правый оператор тоже пуст - устанавливаем левый оператор
		if (this._actionCurrent === null) {

			if (typeof this._result !== 'string') {
				// pushToMemory
				this._expressionDisplay.innerHTML = '';
				this._result = '';
			}

			this._result === '0' ? this._result = value : this._result += value;
			this.displayResult();

		} else {
			if (this._operand === '') {
				// сохраняем значение левого оператора
				this._operand = this._result;
				this._result = '';
			}
			this._result += value;
			this.displayResult();
		}
	}

	setAction(action) {

		// если это функция, принимающая ОДИН параметр
		if (action.length === 1) {

			this._result = this.calculate(action, this._result);

			this.addToExpressionString(action);			
			this.displayResult();
			return;
		}

		// если это функция, принимающая ДВА параметра
		if (this._actionCurrent === null) {
			this._actionCurrent = action;
			this.addToExpressionString(action);

		} else {
			this.addToExpressionString(action);

			this._result = this.calculate(this._actionCurrent, +this._operand, +this._result);
			this._actionCurrent = action;
			this._operand = '';
			this.displayResult();
		}
	}

	/**
	 * [calculate производит арифметические действия с операндами.
	 * поддерживаются как действия типа +, -, т.е., требующие наличия двух операторов,
	 * так и действия типа "извлечение корня", т.е. требующие только одного оператора
	 * @param  {function} action действие
	 * @param  {number} a      первый операнд, обязателен
	 * @param  {number} b      второй операнд, при необходимости
	 * @return {number, object}        результат работы функции, переданной в первом параметре
	 */
	calculate(action, a, b) {

		if (b === undefined) {
			return action(a);

		} else {
			return action(a, b);
		}
	}

	// отображает значение левого операнда
	displayResult() {
		// конвертируем в число, чтобы избавиться от нуля впереди
		this._resultDisplay.innerHTML = +this._result;
	}

	// отображает выражение, которое рассчитывается, передается текущее действие,
	// метод сам решает, что печатать (для унарных операторов - результат выполнения, для бинарных - аргумент и знак действия)
	addToExpressionString(action) {

		if (action.length > 1) {
			if (this._argPrinted === true) {		// проверяем, напечатан ли левый аргумент (например, унарным оператором)
				this._expressionDisplay.innerHTML += ` ${this._buttons[action.name].label} `;
				this._argPrinted = false;
			} else {
				this._expressionDisplay.innerHTML += `${this._result} ${this._buttons[action.name].label} `;
			}

		} else {
			this._expressionDisplay.innerHTML += `${this._result}`;
			this._argPrinted = true;
		}
	}
}

let calculator = new Calc(buttons, buttonsOrder);
document.body.appendChild(calculator.getElem());