
const UIBuilder = require('../index').UIBuilder;

const __PROXYMARK__ = '__proxymark__';


function propIsProperty(o, prop) { return typeof o[prop] === 'string' || typeof o[prop] === 'number' || typeof o[prop] === 'object' || typeof o[prop] === 'boolean'; }
function propIsMethod(o, prop) { return typeof o[prop] === 'function' }

class ComponentElement {
	//TODO: Check if, when `instantiate` is true, the tagname belongs to the COMPONENTS_TREE!
	//i.e. We cannot instantiate the native elements like div etc
	static isProxy(o) { return o[__PROXYMARK__] }

	static UI_COMPONENT_FORM = 'x-UIComponent-Form';
	static UI_COMPONENT_FORM_SETTING = "x-UIComponent-Form-Setting";
	static UI_COMPONENT_MODAL = "x-UIComponent-Modal";
	static UI_COMPONENT_TABLE = "x-UIComponent-Table";
	static UI_COMPONENT_PAGE = "x-UIComponent-Page";
	static UI_COMPONENT_SPA = "x-UIComponent-SPA";

	constructor(tag, innerHTML, defaultState, eventListeners, instantiate, data) {
		this.tag = tag;
		this.states = {};
		this.eventListeners = eventListeners;
		this.instance;
		this.data = data;

		this.currentState = 'default';
		this.defineState('default', defaultState || {});
		this.element = document.createElement(this.tag);
		if (innerHTML) this.element.innerHTML = innerHTML;

		// ======>   'string'  or  'number'  or  'object'  or  'boolean'
		//NOTE: These two arrays, MAY BE incomplete. Add missing methods and properties when we get an error message.
		// const DOM_PROPERTIES_PROXYABLE = ['accessKey', 'attributes', 'childElementCount', 'checked', 'childNodes', 'children', 'classList', 'className', 'clientHeight', 'clientLeft', 'clientTop', 'clientWidth', 'contentEditable', 'dir', 'firstChild', 'firstElementChild', 'id', 'innerHTML', 'innerText', 'isContentEditable', 'lang', 'lastChild', 'lastElementChild', 'namespaceURI', 'nextSibling', 'nextElementSibling', 'nodeName', 'nodeType', 'nodeValue', 'offsetHeight', 'offsetWidth', 'offsetLeft', 'offsetParent', 'offsetTop', 'ownerDocument', 'parentNode', 'parentElement', 'previousSibling', 'previousElementSibling', 'scrollHeight', 'scrollLeft', 'scrollTop', 'scrollWidth', 'style', 'tabIndex', 'tagName', 'textContent', 'title', 'nodelist.length']
		// ======>   'function'
		//NOTE: For some reason, append(), doesn't work if we put it in this array. However, appendChild() does... We define an own method append() later below.
		// const DOM_METHODS_PROXYABLE = ['addEventListener', 'appendChild', 'blur', 'click', 'cloneNode', 'compareDocumentPosition', 'contains', 'focus', 'getAttribute', 'getAttributeNode', 'getElementsByClassName', 'getElementsByTagName', 'getFeature', 'hasAttribute', 'hasAttributes', 'hasChildNodes', 'insertBefore', 'isDefaultNamespace', 'isEqualNode', 'isSameNode', 'isSupported', 'normalize', 'querySelector', 'querySelectorAll', 'remove', 'removeAttribute', 'removeAttributeNode', 'removeChild', 'replaceChild', 'replaceWith', 'removeEventListener', 'setAttribute', 'setAttributeNode', 'toString', 'nodelist.item'];

		this._putState('default');
		if (this.eventListeners) {
			for (let key in this.eventListeners) {
				let eventNames = key.trim().split(',');
				for (let eventName of eventNames) {
					let value = this.eventListeners[key];
					if (!Array.isArray(value)) this.element.addEventListener(eventName, value);
					else for (let f of value) this.element.addEventListener(eventName, f);
				}
			}
		}
		if (instantiate) {
			if (instantiate === true) {
				this.instance = UIBuilder.initComponents(null, this.element, data);
			}
		}

		return new Proxy(this.element, {
			//Manual access proxies to the real DOM element using `set` proxy trap.
			set: (o, prop, value) => {
				if (propIsProperty(o, prop)) { o[prop] = value; }
				else { this[prop] = value; }
				return true;
			},
			//TODO: give precdence to ComponentElement's methods?
			get: (o, prop) => {
				if (prop === __PROXYMARK__) return true;
				if (prop === "append") { return this[prop]; } //Exception. Maybe temporary?
				if (propIsMethod(o, prop)) { // if (DOM_METHODS_PROXYABLE.includes(prop)) {
					return function () {
						let deProxifiedArguments = [];
						for (let arg of arguments) {
							if ((typeof arg === 'object') && arg !== null) {
								if (ComponentElement.isProxy(arg)) deProxifiedArguments.push(arg.element);
							}
							else deProxifiedArguments.push(arg);
						}
						return this.element[prop](...deProxifiedArguments);
					}
				}
				if (propIsProperty(o, prop)) { // if (DOM_PROPERTIES_PROXYABLE.includes(prop)) {
					return this.element[prop];
				}
				return this[prop];
			},
			apply: (o, thisArg, arguemntsArray) => {
				return this.element(...arguemntsArray)
			}
		});
	}

	// ============= Proxy's Private methods =============
	_putState(stateName) {
		if (this.states[stateName].attributes) { for (let attribute in this.states[stateName].attributes) this.element.setAttribute(attribute, this.states[stateName].attributes[attribute]) };
		if (this.states[stateName].classList) { for (let c of this.states[stateName].classList) this.element.classList.add(c) };
		if (this.states[stateName].style) { for (let property in this.states[stateName].style) this.element.style[property] = this.states[stateName].style[property] };
	}

	_removeState(stateName) {
		if (this.states[stateName].attributes) { for (let attribute in this.states[stateName].attributes) this.element.removeAttribute(attribute) };
		if (this.states[stateName].classList) { for (let c of this.states[stateName].classList) this.element.classList.remove(c) };
		if (this.states[stateName].style) { for (let property in this.states[stateName].style) this.element.style[property] = "initial" };
	}

	// ============= Proxy's own Public methods =============
	appendTo(el) {
		el.append(this.element);
		return this;
	}
	getInstance() { return this.instance; }

	instantiate() { this.instance = UIBuilder.initComponents(null, this.element, this.data); }

	get() { return this.element; }

	defineState(stateName, newState) {
		if (!this.states.hasOwnProperty(stateName)) this.states[stateName] = newState;
		else if (stateName === 'default') console.error('ComponentElement-defineState() ERROR: State `default` is reserved for usage in costructor.');
		else console.error('ComponentElement-defineState() ERROR: ', stateName, ' already exists!');
		return this;
	}

	switchToState(stateName) {
		if (this.states.hasOwnProperty(stateName)) {
			if (this.currentState) {
				//Always keep default state's properties
				if (this.currentState !== 'default') this._removeState(this.currentState);
				this._putState(stateName);
			}
			this.currentState = stateName;
		} else console.error('ComponentElement-switchState() ERROR: State ', stateName, ' doesn\'t exist!');
		return this;
	}

	// ============= Proxy's manually proxied Public methods (only for append() at the moment) =============

	append(el) {
		if (ComponentElement.isProxy(el)) this.element.append(el.get());
		else this.element.append(el);
	}

	//Ideally we should use Proxy. HOWEVER, Proxy is flawed because a proxied HTMLElement cannot be used in an append() method. It is not undetectable as it should be!
	//----- Hacks ----- delte...
	//Shortcuts that relay methods to their mirror on the actual DOM element
	// getAttribute(attr) { return this.element.getAttribute(attr) }
	// focus() { this.element.focus() }
	// blur() { this.element.blur() }
	// addEventListener(name, f) { this.element.addEventListener(name, f) }
}

module.exports = ComponentElement;
