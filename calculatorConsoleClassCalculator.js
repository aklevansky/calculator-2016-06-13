'use strict';

/** Класс калькулятор, наследует от класса Operations 
Объекты умебют считать строку без скобок '2+2' (ненужные пробелы удаляются)
*/

/**
 * Класс Calculator
 */
class Calculator extends Operations {

	constructor() {

		// массив с действиями, которыми каждый калькулятор должен владеть от момента создания

		let methods = [{
			method: '+',
			action: (a, b) => a + b,
			precedence: 0
		}, {
			method: '-',
			action: (a, b) => a - b,
			precedence: 0
		}, {
			method: '*',
			action: (a, b) => a * b,
			precedence: 1
		}, {
			method: '/',
			action: (a, b) => {
				try {
					if (b === 0) {
						throw new Error('Попытка деления на ноль: ' + a + ' / ' + b);
					}
					return a / b;

				} catch (e) {
					throw e;
				}

			},
			precedence: 1
		}, {
			method: '**',
			action: (a, b) => Math.pow(a, b),
			precedence: 2
		}];

		// создаем объект operations 
		try {
			super(methods);

		} catch (e) {
			console.log(e.message);
			return NaN;
		}
	}

	// Собственные методы в прототип:

	/**
	 * count(str)
	 * @param  {string} str арифметическое выражение
	 * @return {number}     результат или NaN
	 */
	calculate(str) {

		// переменная для результата вычислений 
		var result = 0;

		try {
			// создаем массив из текущей строки с вычислениями
			// Удаляем из строки пробелы
			var calculation = str.replace(/\s/g, '') || '';;
			// делаем массив
			var calculation = str.split(/\b/);

			result = this.evaluateExpression(calculation);

			return result;

		} catch (e) {
			console.log(e.message);
			return NaN;
		}
	}

	evaluateExpression(calculation) {

		// левый и правый элемент арифметического действия
		var numbers = {};
		// индекс позиции в строке
		var position;
		// приоритет текущих операций (цикл от большего к меньшему)
		var precedence;
		// массив с операциями одного приоритета, получаемый от метода getOperators 
		var currentOperations = [];
		// индекс текущего действия в массиве currentOperations
		var currentAction;
		// результат вычислений
		var result;
		// стэк с операциями одного приоритета, которые выполняются слева направо
		var order = [];
		// позиция текущего действия, взятая из стэка
		var actionPosition;

		try {

			// Проверяем второй символ в строке, он должен быть арифметическим действием
			if (!(calculation[1] in this.methods)) {

				throw new ErrorString(calculation.join(''));
			}

			for (precedence = Operations.MAX_PRECEDENCE; precedence >= 0; precedence--) {
				currentOperations = this.getOperators(precedence);

				for (position = 1; position < calculation.length; position += 2) {

					for (currentAction = 0; currentAction < currentOperations.length; currentAction++) {

						if (calculation[position] === currentOperations[currentAction]) {

							// создаем массив операций одного приоритета к выполнению в данной итерации цикла слева направо
							order.push(position);
							break;
						}
					}
				}

				// сортируем в обратном порядке, чтобы брать элементы через pop();
				order.sort((a, b) => a < b);

				// если нет операций к выполнению
				while (order.length != 0) {

					actionPosition = order.pop();

					numbers = setOperators(actionPosition);

					if (!isNaN(numbers.left) && !isNaN(numbers.rigth)) {
						throw new ErrorString(calculation.join(''));
					}

					result = this.methods[calculation[actionPosition]].action(+numbers.left, +numbers.right);

					if (isNaN(result)) {
						throw new ErrorString(calculation.join(''));
					}

					// записываем результат в тот же массив на место знака действия
					calculation[actionPosition] = result;
					calculation[numbers.leftPosition] = '';
					calculation[numbers.rightPosition] = '';

				}

				while (calculation.indexOf(' ') != -1) {
					calculation.splice(calculation.indexOf(' '), 1);
				}
			}

			return result;

		} catch (e) {
			console.log(e.message);
			return NaN;
		}

		function setOperators(action) {
			// левый и правый операнды арифметического действия и их индексы
			var a;
			var aPosition = action - 1;
			var b;
			var bPosition = action + 1;

			try {
				while (calculation[aPosition] === '') {
					aPosition--;
				}

				if (aPosition < 0) {

					throw new ErrorString(calculation.join('') + ', ошибка здесь: ' + calculation[aPosition] + calculation[action] + calculation[bPosition]);
				}
				var a = calculation[aPosition];

				while (calculation[bPosition] === '') {
					bPosition++;
				}

				if (bPosition >= calculation.length) {
					throw new ErrorString(calculation.join('') + ', ошибка здесь: ' + calculation[aPosition] + calculation[action] + calculation[bPosition]);
				}
				var b = calculation[bPosition];

				return {
					left: a,
					leftPosition: aPosition,
					right: b,
					rightPosition: bPosition
				};

			} catch (e) {
				throw e;
			}
		}
	}

	/**
	 * knownMethods(method, flagValue)
	 *
	 * отображает в консоли известные объекту действия
	 * если флаг = true отображает также приоритеты
	 *
	 * По умолчанию false
	 *
	 * Если задан аргумент method, показывает информацию по одному данному методу,
	 *
	 * ==============================================================
	 * если аргумента method нет, показывает информацию по всем методам
	 * ==============================================================
	 * 
	 * @param  {string} 	method 		арифметическое действие, optional
	 * @param  {boolean} 	flagValue 	если true - показывает приоритеты, optional
	 */
	knownMethods(method, flagValue) {
		// устанавливаем аргументы
		try {

			if (typeof(arguments[0]) === 'string') {
				method = arguments[0];
				flagValue = arguments[1] || false;

			} else if (typeof(arguments[0]) === 'boolean') {
				method = null;
				flagValue = arguments[0];

			} else {
				method = null;
				flagValue = false;
			}

			var key; // счетчик для объектов
			var str = ''; // строка вывода

			if (method === null) {
				console.log('Известные методы: ');
				// Формируем строку и выводим ее
				for (key in this.methods) {
					str += key;
					if (flagValue) {
						str += ' приоритет ' + this.getPrecedence(key) + '\n';
					} else {
						str += ', ';
					}
				}
				console.log(str);
			} else {
				// Формируем строку и выводим
				str += 'Метод ' + method;
				if (method in this.methods) {
					str += ' известен';
					if (flagValue) {
						str += ', приоритет ' + this.getPrecedence(method);
					}
				} else {
					str += ' не известен';
				}
				console.log(str);
			}

		} catch (e) {
			console.log(`Ошибка в knownMethods: ${e.message}`);
		}
	}
}