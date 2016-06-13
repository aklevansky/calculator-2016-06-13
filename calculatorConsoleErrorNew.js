'use strict';

/*Объекты ошибок для калькулятора*/

function ErrorMethodNonexistant(method) {
	Error.call(this);

	this.name = ErrorMethodNonexistant;
this.message = `Метод ${method} отсутствует`;

	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor); // (*)
	} else {
		this.stack = (new Error()).stack;
	}

}

// Наследуем у Error

ErrorMethodNonexistant.prototype = Object.create(Error.prototype);
ErrorMethodNonexistant.prototype.constructor = ErrorMethodNonexistant;

/*--------------------------------------------------*/

function ErrorPrecedence(method) {

	method = method || ''; // для случаев, когда речь не идет о конкретном операторе (функция getOperators (Operations))

	if (method) {			// добавляем пробел после знака для красоты (если не пустая строка)
		method += ' ';
	}

	Error.call(this);

	this.name = ErrorPrecedence;
	this.message = `Приоритет оператора ${method} должен был задан числом от 0 до ${Operations.MAX_PRECEDENCE}`;

	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor); // (*)
	} else {
		this.stack = (new Error()).stack;
	}

}

// Наследуем у Error

ErrorPrecedence.prototype = Object.create(Error.prototype);
ErrorPrecedence.prototype.constructor = ErrorPrecedence;

/*--------------------------------------------------*/

function ErrorFunction(method) {
	Error.call(this);

	this.name = ErrorFunction;
	this.message = `Неправильная функция оператора ${method}`;

	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor); // (*)
	} else {
		this.stack = (new Error()).stack;
	}

}

ErrorFunction.prototype = Object.create(Error.prototype);
ErrorFunction.prototype.constructor = ErrorFunction;

/*--------------------------------------------------*/

function ErrorString(string) {
	Error.call(this);

	this.name = ErrorString;
	this.message = `В строке пропущены операнды либо присутствуют неизвестные символы: ${string}`;

	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor); // (*)
	} else {
		this.stack = (new Error()).stack;
	}

}

// Наследуем у Error
 
ErrorString.prototype = Object.create(Error.prototype);
ErrorString.prototype.constructor = ErrorString;

/*--------------------------------------------------*/

function ErrorParenthesis(parenthesis) {
	Error.call(this);

	var string;

	if (parenthesis === '(') {
		string = 'открывающая ';

	} else if (parenthesis === ')') {
		string = 'закрывающая ';		

	} else {
		string = '';
	}

	this.name = ErrorParenthesis;
	this.message = `Лишняя ${string} скобка`;

	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor); // (*)
	} else {
		this.stack = (new Error()).stack;
	}

}

// Наследуем у Error

ErrorParenthesis.prototype = Object.create(Error.prototype);
ErrorParenthesis.prototype.constructor = ErrorParenthesis;