const COMPONENTS_INSTANCES = require('../../index').COMPONENTS_INSTANCES;
const CssLoader = require('../../index').CssLoader;
const escapeStack = require('../../index').escapeStack;

let style = new CssLoader(require('./style.css.js'));

class UIComponentModal {

	constructor(target) {
		this.target = target;
		this.modalParentContainer = document.querySelector('body');
		this.closeCallback;
		this.elements = this._build();
		escapeStack.push(this);
	}

	//Custom alias for native append();
	append(el) { this.elements.innerTarget.append(el); }

	setInnerHTML(s) { this.elements.innerTarget.innerHTML = s; }

	setCloseCallback(f) { this.closeCallback = f; }

	close() { this.elements.closeButton.dispatchEvent(new Event('click')); } //hack


	_build() {
		let closeCallback = this.closeCallback;

		let styleElement = document.createElement('style');
		document.getElementsByTagName('head')[0].append(styleElement);

		let backdrop = document.createElement('div');
		backdrop.classList.add(style.MODAL_BACKDROP);
		this.modalParentContainer.append(backdrop);

		let modal = this.target;
		modal.classList.add(style.MODAL);
		modal.setAttribute('tabindex', '-1');
		this.modalParentContainer.append(modal);
		console.log('this.target', this.modalParentContainer)

		let header = document.createElement('div');
		header.classList.add(style.MODAL_HEADER);
		modal.append(header);

		// modal.scrollIntoView({behavior: 'smooth' });

		let closeButton = document.createElement('span');
		closeButton.innerText = "🞭";
		closeButton.classList.add(style.MODAL_CLOSEBUTTON);
		closeButton.addEventListener('click', (e) => { closeModal(); });


		header.append(closeButton);

		modal.style.left = this.modalParentContainer.offsetWidth / 2 - modal.offsetWidth / 2 + 'px';
		modal.style.top = window.scrollY + 50 + 'px';

		let innerTarget = document.createElement('div');
		innerTarget.classList.add(style.MODAL_INNER_CONTAINER);
		modal.append(innerTarget);

		function closeModal() {
			let childForms = modal.querySelectorAll('x-UIComponent-Form');
			for (let childForm of childForms) {
				COMPONENTS_INSTANCES.get(childForm).cancel();
			}
			modal.remove();
			styleElement.remove();
			backdrop.remove();
			if (closeCallback) closeCallback();
		}

		modal.focus();

		this.escHandler = closeModal;
		return { innerTarget, closeButton, modal };
	}
}





module.exports = UIComponentModal;