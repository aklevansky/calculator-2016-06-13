'use strict';

/**
 * Класс Expressions
 * наследует от класса Calculator
 * Умеет считать строку со скобками, ненужные пробелы удаляет
 */
class Expressions extends Calculator {

	constructor() {
		try {
			super();

		} catch (e) {
			console.log(e.message);
			return NaN;
		}
	}


	// Собственные методы в прототип

	// Разбивка строки на элементы (создание массива)

	/**
	 * parse(str)
	 * 
	 * Рекурсивная функция
	 * Создает многомерный массив (т.е. по сути массив с вложенными массивами из str)
	 * каждые вложенные скобки становятся новым уровнем массива
	 * каждое число и операнд становятся строковыми элементами массивов
	 *
	 * Например строка '(8+2)/4 -((7 ** 3+ 5)* 3)+2' превращается в массив:
	 * [[8,+,2],/,4,-,[[7,**,3,+,5],*,3],+,2
	 * 
	 * @param  {string} str арифметическое выражение
	 * @return {array}     	многомерный массив
	 */
	parse(str) {

		var i = 0;
		var arr = [];
		var strStart = '';
		var parIndex = {};

		try {

			while (i < str.length) {

				if (resolveParentheses(str, parIndex)) {
					strStart = breakString(str, parIndex.left) // убираем в массив часть до скобки, разбитую на элементы

					if (strStart != '') { // если выражение начинается со скобки (вначале - пусто), ничего не убираем
						/*добавляем новые элементы в конец массива (не как отдельный массив, а по одному)
						решил не использовать concat, чтобы не перезаписывать массив полностью*/

						arr.push.apply(arr, strStart);
					}

					/*Отбрасываем левую скобку и рекурсивно вызываем функцию*/
					arr.push(this.parse(str.slice(parIndex.left + 1, parIndex.right)));

					str = str.slice(parIndex.right + 1); // выбрасываем правую скобку
				} else {

					//проверяем на ошибку в функции resolveParentheses
					// if (error != '') {
					// 	return NaN;
					// }

					arr.push.apply(arr, breakString(str, str.length));
					break;
				}
			}

			return arr;

		} catch (e) {
			console.log(e.message);
			return NaN;
		}

		// дополнительные вложенные функции для обработки строки

		/**
		 * resolveParentheses(str, parPosition)
		 * 
		 * Возвращает true, если скобки есть, false, если скобок нет,
		 * индекс левой скобки в свойстве left объекта parIndex,
		 * индекс правой скобки в свойстве right объекта parIndex
		 *
		 * В случае ошибки: устанавливает текст переменной окружения error
		 * (сообщает, какая скобка пропущена) и всегда возвращает false;
		 *
		 * не меняет строку str
		 * 
		 * @param  {string} str 		строка со скобкой
		 * @param  {object}	parIndex	объект с индексами скобок
		 * @return {boolean}    		есть или нет скобки, при ошибке - false + текс в переменной error
		 */
		function resolveParentheses(str, parPosition) {

			var parCount = 1; // счетчик вложеных скобок

			var i = str.indexOf('('); // позиция левой скобки

			try {
				// проверка на ошибку (не пропущена ли открывающая скобка)
				if (i === -1 && (i < str.indexOf(')'))) {

					throw new ErrorParenthesis(')');
				}

				parPosition.left = i; // устанавливаем в объекте позицию левой скобки

				if (i != -1) { // если есть левая скобка

					for (i += 1; i < str.length; i++) {
						if (str[i] == '(') { // проверяем вложенные скобки
							parCount++;
						}

						if (str[i] == ')') {
							parCount--;

							if (!parCount) {
								parPosition.right = i;
								break;
							}
						}
					}
					// Проверка на ошибку (лишняя  закрывающая скобка)
					if (parCount > 0) {

						throw new ErrorParenthesis('(');
					}
					return true;
				}
			} catch (e) {
				throw e;
			}

			return false;
		}

		/**
		 * breakString(str, end)
		 *
		 * разбиваем строку str от начала до end
		 * на массив из элементов
		 * 
		 * @param  {string} str строка
		 * @param  {number} end конец подстроки
		 * @return {array}     	массив элементов
		 */
		function breakString(str, end) {
			str = str || '';

			//возвращаемый массив
			var elementArray = [];

			elementArray = str.slice(0, end).split(/\b/);

			return elementArray;
		}
	}


	/**
	 * При первом вызове с аргументом массивом аргументов - копирует массив во внутреннюю переменную и возвращает функцию
	 * При вызове с аргументом числом - сохраняет результат и возвращает вычисления следующего уровня 
	 * @return {object} объект с двумя функциями
	 *
	 */
	next(value) {

		try {

			// массив передается только при первом вызове, используем его для настройки замыкания
			if (Array.isArray(value)) {
				this._evaluate = evaluateArray(value);
				return this._evaluate();

			// Во всех прочих случаях выполняется функция evaluateArray, записываемая в this._evaluate
			} else {

				return this._evaluate(value);
			}

		} catch (e) {
			console.log(`Функция next, ${e.message}`);
			return NaN;
		}

		// новая функция, чтобы обеспечить сохранить нужные переменные в окружении.

		function evaluateArray(arr) {

			var level = []; // хранит текущий уровень вложенности
			var previousLevel; // хранит позицию предыдущего уровня
			var position = []; // хранит позицию возвращенного выражения

			var expression = arr.slice();

			return function(result) {

				try {

					if (!arguments.length) {
						return getNext();
					}

					if (!setResult(result)) {
						return getNext();

					} else {
						return null;
					}

				} catch (e) {
					e.message = 'ошибка в _evaluate ' + e.message;
					throw e;
				}

				function getNext() {
					var i = 0; // индекс массива

					try {
						level.push(expression)

						for (; i < expression.length; i++) {

							if (typeof(expression[i]) === 'object') {

								// переходим на следующий уровень и сохраняем его
								expression = expression[i];
								level.push(expression);

								// сохраняем позицию
								position.push(i);
								// следующую итерацию цикла начинаем с 0;
								i = -1;
							}
						}

						return level.pop();

					} catch (e) {
						e.message = 'ошибка в getNext ' + e.message;
						throw e;
					}

				}

				/**
				 * setResult(num)
				 *
				 * всегда вызывается после getNext, записывает результат вычисления на место верхних скобок
				 * 
				 * @param {[type]} num [description]
				 * @return {boolean} false, если результат записан, но вычисления не окончены, true, если результат конечный и вычислять больше нечего
				 */
				function setResult(solution) {

					try {
						if (!level.length) {
							expression = solution;
							return true;
						}
						expression = level.pop();
						expression[position.pop()] = solution;

						return false;

					} catch (e) {
						e.message = 'ошибка в setResult ' + e.message;
						throw e;
					}
				}
			}
		}
	}

	// свой метод для рассчета строки. Вызывает функцию evaluateExpression родителя
	calculate(str) {

		// удаляем лишние пробелы из строки
		this.expression = str.replace(/\s/g, '') || '';

		try {
			/* Массив (как внутренняя переменнная, в котором хранится разбитая на элементы и уровни строка */
			this._expressionArray = this.parse(this.expression);

			var calculation = this.next(this._expressionArray);
			var result;

			while (calculation) {
				result = super.evaluateExpression.call(this, calculation);
				calculation = this.next(result);
			}

			// чистим переменные (на всякий случай)
			this._expressionArray = [];
			this.expression = '';

			return result;

		} catch (e) {
			console.log(e.message);
			return NaN;
		}
	}
}