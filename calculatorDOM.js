'use strict';

;
(function(that) {

	// класс DOM-калькулятора
	class Calc {
		constructor(options) {
			// создаем калькулятор
			this._buttons = options.buttons; // с массивом будет работать удобнее, чем с DOM, поэтому сохраняем
			let buttonsOrder = options.buttonsOrder;

			this._calc = Calc.render(this._buttons, buttonsOrder);

			// глобальные переменные

			// настройки калькулятора
			// Максимальная длина
			this._MAX_LENGTH = options.maxLength; // это очень условно
			// число знаков после запятой
			this._PRECISION = options.precision;
			// отображение результатов вычислений

			// элементы, отображающие текущий результат и выражение (устанавливаются при инициализации ниже)
			this._resultDisplay = null;
			this._expressionDisplay = null;
			this._resultDisplayFontSize = ''; // шрифт, который использован для _resultDisplay
			// текущий ввод пользователя
			this._currentInput = '';
			// текущий операнд, в него для удобства копируется this._currentInput внутри
			// функции setAction
			this._currentOperand = '';
			// массив, содержащий строку (текущее выражение)
			this._expressionString = '';
			// напечатан ли предыдущий оператор
			this._operandPrinted = true;

			// выполнение арифметических действий

			// текущий операнд
			this._operand = null;
			// действие
			this._action = null;
			// промежуточный результат
			this._intermediateResult = null;

			// память калькулятора
			this._memoryObject = null;
			// история вычислений
			this._history = [];
			this._historyObject = null;
			// прочее

			// последняя нажатая клавиша (учитываем только цифры и операции) (для удобства корректировки ввода:
			// если последняя клавиша - цифра, т.е. ввод пользователя - можно корректировать, если была введена операция - нельзя)
			this._lastButton = null;
			// сохраняем текущую структуру при изменении режима ввода
			this._saveExpression = null;
			this._keys = {}; // сюда при инициализации сохраняются клавиши и соответствующие им функции
			this._initialize(options);
		}

		// геттер для промежуточного результата (чтобы можно было обратиться к его значению, 
		// не используя напрямую приватные свойства, нужно для написания функций кнопок как часть внешнего API)
		get intermediateResult() {
			return this._intermediateResult;
		}

		// геттер для значения, которое отображается в поле displayCurrent
		get getDisplay() {

			return this._resultDisplay.innerHTML;
		}

		static render(buttons, buttonsOrder) {
			let calc = document.createElement('div');
			let calcHTML = `<div class='calc'>
					      	<div class='calc-title'>Standard<button value='show' class='calc-button memory'>Memory</button><button class='calc-button history'>History</button></div>
      						<div class="calc-display clearfix">
      						<div class='calc-arrow left invisible'>&#x25c1;</div>
							<div class='calc-arrow right invisible'>&#x25b7;</div>
        					<div class="calc-expression clearfix"><div><span></span></div></div>
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
		_initialize(options) {

			let buttons = options.buttons;

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
			this.displayResult('0');

			// пишем в прототип новые функции
			setPrototype(buttons);
			// добавляем обработчики событий
			addEventHandlers.call(this);

			// иниализируем массив this._keys с клавишами (для клавиатурных событий)
			for (let button in buttons) {
				if (buttons[button].hasOwnProperty('key')) {
					if (Array.isArray(buttons[button].key)) {
						buttons[button].key.forEach(keyEl => {
							this._keys[keyEl] = button;
						});
					} else {
						this._keys[buttons[button].key] = button;
					}
				}
			}

			// иниализируем объект памяти;
			this._memoryObject = setMemoryObject.call(this, options);
			this._historyObject = new CalcHistory({
				show: options.showHistoryPanel,
				calc: this
			});
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
					calc.addEventListener('dblclick', this._expressionInput.bind(this));

					document.body.addEventListener('keydown', this._onUserKeyboardEvent.bind(this));
					document.body.addEventListener('keyup', this._onUserKeyboardEvent.bind(this));

					calc.addEventListener('DOMKeyPressed', this._onDOMKeyPressed.bind(this));
					// прокручивание выражения
					calc.querySelector('.calc-display').addEventListener('click', this._scrollExpression.bind(this));
				}

			}

			function setMemoryObject(options) {

				let memoryButtons = {};

				options.buttonsMemoryPanel.forEach((button) => {
					memoryButtons[button] = this._buttons[button];
				});

				return new CalcMemory({
					buttons: memoryButtons,
					buttonsOrder: options.buttonsMemoryPanel,
					show: options.showMemoryPanel,
					calc: this
				});
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

			let button = e.target.closest('.calc-button');

			if (!button || button.classList.contains('inactive')) {
				return;
			}

			this._lastButton = button;

			let event = this.generateUserEvent(button);
			if (event.type === 'DOMKeyPressed') {
				this._calc.dispatchEvent(event);
			} else if (event.type === 'MemoryKeyPressed') {
				this.getMemoryPanel().dispatchEvent(event);
				this.setStatusMemoryButtons.call(this);
				this.memoryButtonStatus();
			} else if (event.type === 'HistoryPush') {
				this.getHistoryPanel().dispatchEvent(event);
				this.historyButtonStatus();
			}

		}

		_onUserKeyboardEvent(e) {

			// если включен режим ввода выражения
			if (this._saveExpression !== null) {
				return;
			}

			let button = {};

			if (e.type === 'keydown') {
				let char = e.key;

				if (!(char in this._keys)) {
					return;
				}

				button = this._calc.querySelector(`[value='${this._keys[char]}']`);

				if (!button || button.classList.contains('inactive')) {
					return;
				}

				this._lastButton = button;

				button.classList.add('calc-button-pressed');

				let event = this.generateUserEvent(button);
				this._calc.dispatchEvent(event);

				// при поднятии клавиши - удаляем стиль
			} else if (e.type === 'keyup') {
				if (this._lastButton) {
					this._lastButton.classList.remove('calc-button-pressed');
				}
			}
		}

		// если нажата клавиша с цифрой или действием, также устанавливается this._lastButton 
		generateUserEvent(button) {

			let action = null;
			let type = null;
			let value = null;

			if (button.classList.contains('operation')) {
				action = this._buttons[button.value].value;
				type = 'operation';

			} else if (button.classList.contains('digit')) { // если нажата цифра
				value = this._buttons[button.value].label;
				type = 'digit';

			} else if (button.classList.contains('settings')) {
				action = this._buttons[button.value].value;
				type = 'settings';
			} else if (button.classList.contains('memory') && button.closest('.calc-memory-buttons') === null) {

				// фиксируем значение
				this.setDisplay(this._resultDisplay.innerHTML);
				let action;
				if (this._buttons[button.value]) {
					action = this._buttons[button.value].value;
				} else {
					action = button.value;
				}

				return new CustomEvent('MemoryKeyPressed', {
					detail: {
						action: action,
						value: this._resultDisplay.innerHTML,
						current: -1 // действие производится на последнем значении в памяти (см. объект памяти)
					}
				});

				//	this.getMemoryPanel().dispatchEvent(memoryEvent);

			} else if (button.classList.contains('history') && button.closest('.calc-history-panel') === null) {
				return new CustomEvent('HistoryPush', {
				detail: {
					action: 'show',
					result: null,
					expression: null
				}
			});
			}

			return new CustomEvent('DOMKeyPressed', {
				detail: {
					'action': action,
					'type': type,
					'value': value
				}
			});

		}

		_scrollExpression(e) {

			if (e.target.classList.contains('left')) {
				scrollLeft.call(this);

			} else if (e.target.classList.contains('right')) {
				scrollRight.call(this);
			}

			// функции прокрутки
			function scrollLeft() {

				let margin;

				if (this._expressionDisplay.style.marginRight === '') {
					margin = 0;

				} else {
					margin = Math.abs(parseFloat(this._expressionDisplay.style.marginRight));
				}

				let elFullWidth = this._expressionDisplay.offsetWidth;
				let displayWidth = this._calc.querySelector('.calc-expression').clientWidth;

				margin += Math.min(elFullWidth - displayWidth, displayWidth);

				if (margin > elFullWidth - displayWidth) {
					margin = elFullWidth - displayWidth;
				}

				this._expressionDisplay.style.marginRight = -margin + 'px';
			}

			function scrollRight() {

				let margin = Math.abs(parseFloat(this._expressionDisplay.style.marginRight));

				if (isNaN(margin)) { // margin = '';
					return;
				}

				let displayWidth = this._calc.querySelector('.calc-expression').clientWidth;

				margin -= displayWidth;

				if (margin < 0) {
					margin = 0;
				}
				this._expressionDisplay.style.marginRight = -margin + 'px';
			}
		}

		_onDOMKeyPressed(e) {
			// чистим строку с выражением
			if (this._expressionString === '') {
				this.displayExpressionString();
			}

			// скроллим строку с выражением
			this._expressionDisplay.style.marginRight = '';

			this.evaluate(e.detail.type, e.detail.value, e.detail.action);
		}

		// методы объекта
		getElem() {
			return this._calc;
		};

		getMemoryPanel() {
			return this._memoryObject.getElem();
		}

		getHistoryPanel() {
			return this._historyObject.getElem();
		}

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
				action.call(this, value);

			} else if (type === 'memory') {
				action.call(this, value);
			}
		}

		/*
		setOperands: настройка операндов арифметических действий
		setAction: настройка соответствующих действий
		calculate: сам расчет
		 */
		setOperands(value) {

			// обрабатываем десятичную точку
			if (value === '.') {
				if (this._currentInput === '' || this._currentInput === '0') {
					value = '0.';
				} else if (this._currentInput.indexOf('.') != -1) {
					return;
				}
			}

			this._currentInput === '0' ? this._currentInput = value : this._currentInput += value;

			if (this._currentInput.length > this._MAX_LENGTH) {
				this._currentInput = this._currentInput.slice(0, -1);
			}

			if (this._currentInput.indexOf('.') != -1) {
				let decimal = this._currentInput.split('.');
				if (decimal[1].length > this._PRECISION) {
					decimal[1] = decimal[1].slice(0, -1);
				}
				this._currentInput = decimal.join('.');
			}

			this.displayResult(this._currentInput);
		}

		setAction(action) {

			if (this._currentOperand != this._currentInput && this._currentInput !== '') {
				this._currentOperand = this._currentInput;
			}
			// если вначале было нажатие не на цифру, а на знак действие
			if (this._currentOperand === '' & this._operand === null & this._intermediateResult === null) {
				return
			}

			this._currentOperand === '' ? this._operand = this._operand : this._operand = this._currentOperand;

			// если нажат знак равно, вызываем сразу его функцию, она завершит расчеты и сохранит значения
			if (action.name === 'result') {
				action.call(this);
				return;
			}

			// унарные операторы
			if (action.length === 1) {

				this._unaryAction(action);
				// бинарные операторы
			} else {

				this._binaryAction(action);

			}
		}

		_unaryAction(action, operand) {
			// если не был указан аргумент (т.е. , например, нажаты три кнопки '9' '+' 'sqrt')
			if (!this._operand) {
				this._operand = +this._intermediateResult;
			}
			this._operand = this.calculate(action, this._operand);
			this.displayResult(+this._operand);
			// отображаем при необходимости знак предыдущего действия
			if (this._action !== null && this._action.length === 2) {
				this.displayExpressionString(`${this._buttons[this._action.name].label} ${this._operand}`);
			} else {
				this.displayExpressionString(this._operand);
			}

			this._operandPrinted = false

			this._currentOperand = '';
			this._currentInput = '';
		}

		_binaryAction(action) {

			// если знак действия был нажат сразу после другого знака действия
			if (this._currentOperand === '') {
				// если не было унарного действия
				if (this._operandPrinted === true) {
					this.displayExpressionString(this._buttons[action.name].label);
					this._action = action;
					return;
				}
			}

			// если уже есть первый оператор
			if (this._intermediateResult !== null) {

				this._intermediateResult = this.calculate(this._action, +this._intermediateResult, +this._operand);
				this.displayResult(+this._intermediateResult);

				this.addToExpressionString(this._buttons[this._action.name].label);
				this._action = action;

				this.addToExpressionString(this._operand);
				this._operandPrinted = true;
				// отображаем значок следующего действия
				this.displayExpressionString(this._buttons[action.name].label);
				this._currentOperand = '';
				this._currentInput = '';

			} else {
				this._intermediateResult = this._operand;
				this.addToExpressionString(this._operand);
				this._operandPrinted = true;
				// отображаем значок действия
				this.displayExpressionString(this._buttons[action.name].label);
				this._action = action;
				this._operand = null;
				this._currentOperand = '';
				this._currentInput = '';
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
				// через call, чтобы была возможность использовать this (например, доступ к геттеру this.immediateResult)
				return action.call(this, a);

			} else {
				// через call, чтобы была возможность использовать this. Пока такой необходимости нет, но на будущее
				let result = action.call(this, a, b);
				return this.precision(result);
			}
		}

		// вывод на экран

		// выводит переданное значение в элемент this._resultDisplay
		displayResult(result = '0') {
			this._resultDisplay.innerHTML = result;

			this._fitResultFont();
		}

		// добавляет переданных аргумент к строке с выражением (this._expressionString),
		// которая выводится в this._expressionDisplay
		addToExpressionString(num) {
			this._expressionString += ` ${num} `;
			this._expressionDisplay.innerHTML = this._expressionString;
			this._fitExpressionToWidth();
		}

		// отображает текущую строку this.expressionString в this._expressionDisplay
		displayExpressionString(num = '') {
			this._expressionDisplay.innerHTML = `${this._expressionString} ${num}`;
			this._fitExpressionToWidth();
		}

		_fitResultFont() {

			if (this._resultDisplayFontSize === '') {
				this._resultDisplayFontSize = getComputedStyle(this._resultDisplay).fontSize;
			}

			this._resultDisplay.style.fontSize = this._resultDisplayFontSize;

			let elemFullSize = this._resultDisplay.offsetWidth;
			let parentSize = this._resultDisplay.parentElement.clientWidth;

			while (elemFullSize > parentSize) {
				let font = parseFloat(getComputedStyle(this._resultDisplay).fontSize);
				font -= 0.1;
				this._resultDisplay.style.fontSize = font + 'px';
				elemFullSize = this._resultDisplay.offsetWidth;
			}
		}

		resetExpressionString() {
			this._expressionDisplay.innerHTML = '';
			this._expressionString = '';
			this._fitExpressionToWidth();
		}

		_fitExpressionToWidth() {
			let elFullWidth = this._expressionDisplay.offsetWidth;
			let displayWidth = this._calc.querySelector('.calc-expression').clientWidth;

			if (elFullWidth > displayWidth) {
				this._calc.querySelector('.calc-arrow.left').classList.remove('invisible');
				this._calc.querySelector('.calc-arrow.right').classList.remove('invisible');
			} else {
				this._calc.querySelector('.calc-arrow.left').classList.add('invisible');
				this._calc.querySelector('.calc-arrow.right').classList.add('invisible');
			}
		}

		_expressionInput(e) {


			let current = e.target.closest('.calc-expression');

			if (current === this._calc.querySelector('.calc-expression')) {
				// выключаем все кнопки
				this.activeKeyboard.call(this, false);

				let saveExpression = this._expressionDisplay.innerHTML;
				this.cancel();
				let newInput = document.createElement('input');
				newInput.className = 'calc-input';

				this._saveExpression = current.replaceChild(newInput, current.firstElementChild);
				newInput.addEventListener('change', this._evaluateString.bind(this));

			} else if (this._saveExpression !== null) {
				this._calc.querySelector('.calc-expression').innerHTML = this._saveExpression;
			}

		}


		_evaluateString() {
			this.activeKeyboard.call(this, true);
			this.setStatusMemoryButtons.call(this);

			let current = this._calc.querySelector('.calc-input');
			if (current) {
				current.parentElement.replaceChild(this._saveExpression, current);

				let consoleCalc = new Expressions;
				let expression = current.value;
				let result = consoleCalc.calculate(expression);

				this._saveExpression = null;

				this._expressionString = expression + ' =';
				this.displayExpressionString();
				// чтобы следующие вычисления начинались с чистой строки
				this._expressionString = '';

				if (isNaN(result)) {
					result = 'См. консоль';
				}

				this.displayResult(result);
			}
		}

		// функции для кнопок:
		// кнопка =
		result() {
			// если не было произведено действий
			if (this._action) {

				if (this._operand === null) {
					this._operand = this._intermediateResult;
					this._currentOperand = this._operand;
				}
				this._binaryAction(this._action);
				this._binaryAction(this.result);

			} else {
				if (this._currentOperand === '') {
					this._currentOperand = this._operand;
				}
				this.addToExpressionString(`${this._currentOperand} =`);
				this.displayResult(+this._currentOperand);
				this._currentInput = '';
			}

			this.pushToHistory();
			if (this._lastButton && this._lastButton.value === 'result') {
				this._lastButton.classList.remove('calc-button-pressed');
			}

			let temp = this._resultDisplay.innerHTML;
			this.cancel();
			this.displayResult(temp);
		}

		// Кнопки корректировки
		// кнопка backspace (или delete)
		deleteLastDigit() {

			// если это не ввод пользователя
			if (this._currentInput !== this._resultDisplay.innerHTML) {
				return;
			}

			if (this._currentInput.length > 1) {
				this._currentInput = this._currentInput.slice(0, -1);

				this.displayResult(this._currentInput);

			} else {
				this._currentInput = '0';
				this.displayResult(this._currentInput);
			}
		}

		// Кнопка СЕ, сбрасывает в ноль текущий операнд
		correctError() {
			this._operand = 0;
			this._currentOperand = '';
			this._currentInput = '';
			this.displayResult('0');
		}

		// Кнопка C
		// фактически - сигнал, сбросить все на значения по умолчанию
		cancel() {
			this._operand = null;
			this._operandPrinted = true;
			this._intermediateResult = null;
			this._currentInput = '';
			this._currentOperand = '';
			this.resetExpressionString();
			this._action = null;
			this.displayResult('0');
		}

		precision(num) {
			let val = num + '';	// переводим в строку

			if (val.indexOf('.') !== -1) {
				let arr = val.split('.');

				if (arr[1].length > this._PRECISION) {
					arr[1] = arr[1].slice(0, this._PRECISION);
				}

				val = arr.join('.');
			}

			return +val;
		}

		setDisplay(val) {

			if (val === undefined) {
				return;
			}

			this._currentOperand = val;
			this._currentInput = '';
			this.displayResult(this._currentOperand);

		}

		setStatusMemoryButtons() {
			let buttons = []

			buttons.push(this._calc.querySelector('[value="memoryRecall"]'));
			buttons.push(this._calc.querySelector('[value="memoryClear"]'));

			if (!this._memoryObject.getStatus()) {
				deactivate(buttons);
			} else {
				activate(buttons);
			}

			function deactivate(buttons) {

				buttons.forEach((button) => {
					if (button) {
						button.classList.add('inactive');
					}
				});
			}

			function activate(buttons) {
				buttons.forEach((button) => {
					if (button) {
						button.classList.remove('inactive');
					}
				});

			}
		}

		activeKeyboard(flag) {
			let buttons = this._calc.querySelectorAll('.calc-button');


			for (let i = 0; i < buttons.length; i++) {
				if (buttons[i]) {
					if (flag) {
						buttons[i].classList.remove('inactive');
					} else {
						buttons[i].classList.add('inactive');
					}
				}
			}
		}

		historyButtonStatus() {
			if (this.getHistoryPanel().style.display !== 'none') {
				this.getElem().querySelector('.calc-button.history').classList.add('calc-button-pressed');

			} else {
				this.getElem().querySelector('.calc-button.history').classList.remove('calc-button-pressed');
			}
		}

		memoryButtonStatus() {
			if (this.getMemoryPanel().style.display !== 'none') {
				this.getElem().querySelector('.calc-button.memory').classList.add('calc-button-pressed');

			} else {
				this.getElem().querySelector('.calc-button.memory').classList.remove('calc-button-pressed');
			}
		}
		// история
		// убираем в историю калькулятора результат и выражение
		pushToHistory() {
			this.getHistoryPanel().dispatchEvent(new CustomEvent('HistoryPush', {
				detail: {
					action: 'pushToHistory',
					result: this._resultDisplay.innerHTML,
					expression: this._expressionDisplay.innerHTML
				}
			}));
		}

		pullFromHistory() {

			if (this._history.length === 0) {
				this._history.push('');
				this._history.push('0');
			}

			this._resultDisplay.innerHTML = this._history.pop();
			this._expressionDisplay.innerHTML = this._history.pop();

			this._expressionString = '';
			this._currentInput = '';
			this._currentOperand = '';
		}
	}


	that.Calc = Calc;

})(window);