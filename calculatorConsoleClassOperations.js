'use strict';

/**
 * Базовый родительский класс Operations
 */

class Operations {

	constructor(methods) {
		this.methods = {};

		// Создаем массив для хранения приоритетов операций и прячем его от for... in;
		this.methods._precedenceList = new Array([],[],[]);

		Object.defineProperty(this.methods, '_precedenceList', {
			enumerable: false
		});

		// Создаем арифметические действия, если передан соответствующий аргумент

		var i = 0; // счетчик цикла
			if (methods) {

				for (i = 0; i < methods.length; i++) {

					this.addMethod(methods[i].method, methods[i].action, methods[i].precedence);
				}
			}
	}


	// Статическое свойство-константа

	static get MAX_PRECEDENCE() {
		return 2
	};

	// Наследуемые методы и свойства в прототип

	/**
	 * addMethod(name, func, precedence)
	 *
	 * Добавляет в объект арифметические действия
	 * Если оператор уже есть, перезаписывает функцию и возвращает true, больше ничего не меняет
	 * @param {string} 		name       название действия (пример '+')
	 * @param {function} 	func     соответствующая функция (пример: function(a,b){return a+b;})
	 * @param {number} 		precedence приоритет оператора (от 0 до 2), например, у сложения 0
	 * 
	 * @return {boolean} 	успешно - true, иначе false
	 */
	addMethod(name, func, precedence) {
		try {

			/*Переданная функция должна возвращать числовой результат, проверяем*/
			testMethod(func);

			// если оператор уже есть, перезаписывает функцию и возвращает true, больше ничего не меняет
			if (name in this.methods) {
				this.methods[name].action = func;
				return true;
			}

			precedence = precedence || 0; // устанавливаем приоритет по умолчанию

			if (isFinite(precedence) && (precedence >= 0 && precedence < (Operations.MAX_PRECEDENCE + 1))) {
				this.methods._precedenceList[precedence].push(name); // создаем запись в precedenceList		

			} else {
				throw new ErrorPrecedence(name);
			}

			/*Создаем нужное свойство в объекте*/
			this.methods[name] = {
				action: func,
			};

			return true;

		} catch (e) {

			console.log(e.message);
			return false;
		}


		/*----------------------------------------------------*/

		// Вспомогательная функция для проверки переданной функции

		function testMethod(func) {
			try {
				if (isFinite(func(3, 2))) { // проверяет, как работает функция с двумя числами
					return true;
				}
				throw new ErrorFunction(name);

			} catch (e) {
				throw e; // пробрасываем дальше, чтобы внутри основной функции обработать
			}
		}
	}

	/**
	 * getPrecedence(method)
	 *
	 * ищет позицию приоритета операции в многомерном массиве
	 * precedenceList
	 * 
	 * @param  {string} method операция, приоритет которой ищется
	 * @return {number}     возвращаемый индекс, при ошибке NaN
	 */
	getPrecedence(method) {
		try {
			if (!(method in this.methods)) {

				throw new ErrorMethodNonexistant(method);
			}

			var level = 0;
			var position = 0;

			for (; level < this.methods._precedenceList.length; level++) {
				position = this.methods._precedenceList[level].indexOf(method);
				if (position != -1) {
					return level;
				};
			}

		} catch (e) {
			console.log(e.message);
			return NaN;
		}
	}

	/**
	 * changePrecedence(method, precedence)
	 *
	 * Меняет приоритет действия method на precedence
	 * @param  {string} method арифметическое действие
	 * @param  {number} precedence желаемый приоритет
	 * @return {boolean}        успешно - true, иначе false
	 */
	changePrecedence(method, precedence) {

		var index = this.getPrecedence(method);
		var i = 0; // индекс массива

		try {

			if (!(method in this.methods)) {
				throw new ErrorMethodNonexistant(method);
			}

			if (!isFinite(precedence) && (precedence >= 0 && (precedence < (Operations.MAX_PRECEDENCE + 1)))) {
				throw new ErrorPrecedence(method);
			}

			// ищем текущий элемент в массиве и удаляем
			for (; i < this.methods._precedenceList[index].length; i++) {
				if (this.methods._precedenceList[index].indexOf(method) != -1) {
					this.methods._precedenceList[index].splice(this.methods._precedenceList[index][i], 1);
					this.methods._precedenceList[precedence].push(method);
					break;
				}
			}
			return true;

		} catch (e) {

			console.log(e.message);
			return false;
		}
	};

	/**
	 * getOperators(precedence)
	 *
	 * Получает массив из всех операторов заданного приоритета
	 * 
	 * @param  {number} precedence	уровень приоритета
	 * @return {array}            массив с арифметическими действиями данного уровня, при ошибке NaN
	 */
	getOperators(precedence) {

		try {
			if (isFinite(precedence) && (precedence >= 0 && (precedence < (Operations.MAX_PRECEDENCE + 1)))) {
				return this.methods._precedenceList[precedence];

			} else {
				throw new ErrorPrecedence('');
			}

		} catch (e) {
			console.log(e.message);
			return NaN;
		}
	}
}