'use strict';

class CalcPanel {
	constructor(options) {
		this._visibility = options.show;
		this._elem = CalcPanel.render(this._visibility);

		// есть или нет объекты внутри
		this._status = false;
		this._items = [];

	}

	static render(show) {
		let elem = document.createElement('div');
		elem.className = 'calc-panel';

		if (!show) {
			elem.style.display = 'none';
		}

		return elem;
	}

	show() {
		if (this._elem.style.display === 'none') {
			this._elem.style.display = '';
			this._renderMemoryItems();
		} else {
			this._elem.innerHTML = '';
			this._items.length = 0;
			this._elem.style.display = 'none';
		}
	}

	getElem() {
		return this._elem;
	}

	getStatus() {
		return this._status;
	}


}

class CalcMemory extends CalcPanel {
	constructor(options) {
		super(options);

		this._buttons = options.buttons;
		//		this._visibility = options.show;

		//		this._elem = CalcMemory.render(this._visibility);
		this._buttonsPanel = null;
		this._calc = null;
		this._initialize(options);

		this._memoryValues = [];

	}


	static render(show) {
		let elem = document.createElement('div');
		elem.className = 'calc-memory';

		if (!show) {
			elem.style.display = 'none';
		}

		return elem;
	}

	_renderMemoryItems() {

		if (this._memoryValues.length === 0) {
			this._elem.innerHTML = '';
			this._status = false;
			let wrapper = document.createElement('div');
			wrapper.className = 'calc-memory-variables clearfix';
			let item = document.createElement('div');
			item.className = 'calc-memory-variable';
			item.innerHTML = "<p>There'is nothing saved in Memory</p>";
			wrapper.appendChild(item);
			this._elem.appendChild(wrapper);

		} else {

			this._elem.innerHTML = '';
			this._status = true;
			this._memoryValues.forEach((val) => {
				let wrapper = document.createElement('div');
				wrapper.className = 'calc-memory-variables clearfix';
				let item = document.createElement('div');
				item.className = 'calc-memory-variable';
				item.appendChild(document.createTextNode(val));
				wrapper.appendChild(item);
				wrapper.appendChild(this._buttonsPanel.cloneNode(true));

				this._items.push(wrapper);
			});

			let external = document.createElement('div');
			external.className = 'wrapper';
			this._elem.appendChild(external);

			let inner = this._elem.firstElementChild;

			this._items.forEach((item) => {
				inner.insertBefore(item, inner.firstElementChild);
			});

		}
	}

	_initialize(options) {
		this._elem.addEventListener('click', this._onUserClick.bind(this));
		this._elem.addEventListener('MemoryKeyPressed', this._onMemoryKeyPressed.bind(this));

		this._calc = options.calc;
		// Массив с кнопками
		this._buttonsPanel = document.createElement('div');
		this._buttonsPanel.className = 'calc-memory-buttons';

		let buttonsHTML = '';

		options.buttonsOrder.forEach(function(button) {
			buttonsHTML += `<button value="${button}" class="calc-button memory">${options.buttons[button].label}</button>`;
		});

		this._buttonsPanel.innerHTML = buttonsHTML;
	}

	_onUserClick(e) {

		let button = e.target.closest('.calc-button.memory');

		if (button) {
			let number = getNumber(e.target.closest('.calc-memory-variables'));
			let memoryEvent = new CustomEvent('MemoryKeyPressed', {
				detail: {
					action: this._buttons[button.value].value,
					value: this._calc.getDisplay,
					current: number
				},
			});

			this._elem.dispatchEvent(memoryEvent);

			return;
		}

		button = e.target.closest('.calc-memory-variables');

		if (button) {
			let number = button.firstElementChild.firstChild.data;
			let memoryEvent = new CustomEvent('MemoryKeyPressed', {
				detail: {
					action: 'memoryRecall',
					value: 'memoryRecall',
					current: number
				}
			});
			this._elem.dispatchEvent(memoryEvent);
			this.show();

			return;
		}

		function getNumber(el) {
			let container = el.closest('.wrapper'); // поменять верстку
			for (let i = 0; i <= container.children.length; i++) {
				if (el === container.children[container.children.length - 1 - i]) {
					return i;
				}
			}
			return -1
		}
	}

	_onMemoryKeyPressed(e) {

		if (!(e.detail.action in this)) {
			this._memoryAction(e.detail.action, e.detail.value, e.detail.current);

		} else {
			this[e.detail.action](e.detail.current);
		}

		if (this._memoryValues.length) {
			this._status = true;
		} else {
			this._status = false;
		}
	}

	_memoryAction(func, val, num) {

		if (this._memoryValues.length === 0) {
			this._memoryValues.push(0);
		}

		if (num === -1) {
			// действие над последним значением
			num = this._memoryValues.length - 1
		}

		this._memoryValues[num] = func(this._memoryValues[num], val);

		if (this._items.length) {
			this._updateDOM(num);
		}
	}

	_updateDOM(num) {
		if (this._items[num]) {
			// в обратном порядке
			this._items[num].querySelector('.calc-memory-variable').firstChild.data = this._memoryValues[num];
		}
	}



	memoryClear(num) {
		if (num === -1) {
			this._memoryValues.length = 0;

		} else {
			this._memoryValues.splice(num, 1);
			this._items[num].remove();
			this._items.splice(num, 1);

			if (this._memoryValues.length === 0) {
				this._renderMemoryItems();
			}
		}
	}

	memorySave() {
		this._memoryValues.push(this._calc.getDisplay);
	}

	memoryRecall(val) {

		if (val === -1) {

			val = this._memoryValues.pop();
		}
		let calcEvent = new CustomEvent('DOMKeyPressed', {
			detail: {
				'action': Calc.prototype.setDisplay,
				'type': 'memory',
				'value': val
			}
		});

		this._calc.getElem().dispatchEvent(calcEvent);
	}

}


class CalcHistory extends CalcPanel {
	constructor(options) {
		super(options);
		this._calc = options.calc;
		this._elem.classList.add('calc-history');
		this._historyValues = [];
		this._elem.addEventListener('HistoryPush', this._onHistoryPush.bind(this));
		this._elem.addEventListener('click', this.popFromHistory.bind(this));
	}

	_renderHistoryItems() {
		this._elem.innerHTML = '';
		this._status = false;
		let wrapper = document.createElement('div');
		wrapper.className = 'calc-history-elements clearfix';

		if (this._historyValues.length === 0) {

			let item = document.createElement('div');
			item.className = 'calc-history-element';
			item.innerHTML = "<p>There'is no history yet</p>";
			wrapper.appendChild(item);
			this._elem.appendChild(wrapper);

		} else {
			this._historyValues.forEach((value) => {
				let item = document.createElement('div');
				item.className = 'calc-history-element clearfix';

				let expression = document.createElement('div');
				expression.className = 'calc-history-expression';
				expression.appendChild(document.createTextNode(value.expression));
				item.appendChild(expression);

				let result = document.createElement('div');
				result.className = 'calc-history-result';
				result.appendChild(document.createTextNode(value.result));
				item.appendChild(result);

				wrapper.insertBefore(item, wrapper.firstElementChild);
			});

			this._elem.appendChild(wrapper);
		}
	}

	_onHistoryPush(e) {
		if (e.detail.action in this) {
			this[e.detail.action](e.detail);
		}
		this._renderHistoryItems();
	}

	pushToHistory(e) {
		this._historyValues.push({
			expression: e.expression,
			result: e.result
		});
	}

	popFromHistory(e) {
		let element = e.target.closest('.calc-history-element');

		if (element) {
			let expression = element.querySelector('.calc-history-expression').firstChild.data;
			let result = element.querySelector('.calc-history-result').firstChild.data;


			this._calc.getElem().dispatchEvent(new CustomEvent('DOMKeyPressed', {
				detail: {
					action: Calc.prototype.cancel,
					type: 'settings'
				}
			}));
			this._calc.getElem().dispatchEvent(new CustomEvent('DOMKeyPressed', {
				detail: {
					action: Calc.prototype.setDisplay,
					type: 'settings',
					value: result
				}
			}));

			this._calc.getElem().dispatchEvent(new CustomEvent('DOMKeyPressed', {
				detail: {
					action: Calc.prototype.resetExpressionString,
					type: 'settings'
				}
			}));

			this._calc.getElem().dispatchEvent(new CustomEvent('DOMKeyPressed', {
				detail: {
					action: Calc.prototype.displayExpressionString,
					type: 'settings',
					value: expression
				}
			}));

		}
	}

	show() {
		if (this._elem.style.display === 'none') {
			this._elem.style.display = '';
			this._renderHistoryItems();
		} else {
			this._elem.innerHTML = '';
			this._items.length = 0;
			this._elem.style.display = 'none';
		}
	}
}