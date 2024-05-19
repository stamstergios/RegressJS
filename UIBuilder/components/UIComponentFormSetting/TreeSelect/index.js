const NamesChainStringBuilder = require('../../../common').NamesChainStringBuilder;
const CssLoader = require('../../../index').CssLoader;

let style = new CssLoader(require('./style.css.js'));

module.exports = class TreeSelect {

	constructor(target, data, inputName, levelsCount, initialIdsArray) {
		this.target = target;
		this.inputName = inputName;
		this.localInstances = new Map();
		this.openedSublevels = [];
		this.levelsCount = levelsCount;
		this.selectedChain = [];
		this.leafSelected = false;
		this.opened = false;
		this.pageBody = document.querySelector('body');
		this.placeholder = "Select a category";

		this.globalContainer = document.createElement('div');
		this.globalContainer.classList.add(style.TREESELECT);

		this.innerContainer = document.createElement('div');
		this.innerContainer.classList.add(style.INNER_CONTAINER);
		this.globalContainer.append(this.innerContainer);
		this._traverseAndBuild(data, this.innerContainer);

		this.controlContainer = document.createElement('div');
		this.controlContainer.classList.add(style.CONTROL_CONTAINER);
		this.controlContainer.setAttribute('tabindex', '');
		this.target.append(this.controlContainer);

		this.button = document.createElement('button');
		this.button.classList.add(style.CONTROL_BUTTON);
		this.button.setAttribute('type', 'button');

		let namesChainStringBuilder = new NamesChainStringBuilder(data);
		if (initialIdsArray) {
			console.log(initialIdsArray)
			let namesHTML = "";
			let namesArray = namesChainStringBuilder.build(initialIdsArray, 'properties.name');
			for (let i = 0; i < namesArray.length; i++) namesHTML += "<span class=\"" + style.NAMES_CHAIN_ITEM + "\">" + namesArray[i] + "</span>" + (i < namesArray.length - 1 ? ' - ' : '');
			this.button.innerHTML = namesHTML;
			this.placeholder = namesHTML;
		} else this.button.innerText = this.placeholder;
		this.button.classList.add(style.NOT_SELECTED);
		this.controlContainer.append(this.button);

		this.dummyInput = document.createElement('input');
		this.dummyInput.type = 'hidden';
		this.dummyInput.name = this.inputName;
		this.controlContainer.append(this.dummyInput);


		this.button.addEventListener('click', e => {
			e.stopPropagation();
			if (this.opened) {
				this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_closed'));
				this.globalContainer.remove();
				this.opened = false;
				this.button.classList.remove(style.CONTROL_BUTTON_CLICKED);
				for (let i = 0; i < this.openedSublevels.length; i++) this._closeSublevel(this.openedSublevels[i]);
			} else {
				this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_opened'));
				this.button.classList.add(style.CONTROL_BUTTON_CLICKED);
				this.pageBody.insertBefore(this.globalContainer, this.pageBody.children[0]);
				this.globalContainer.style.minWidth = this.controlContainer.offsetWidth + 'px';
				this.globalContainer.style.top = this.controlContainer.getBoundingClientRect().top + window.scrollY + this.controlContainer.offsetHeight + 'px';
				this.globalContainer.style.left = this.controlContainer.getBoundingClientRect().left + window.scrollX + 'px';
				this.opened = true;
			}
		}, false);

		window.addEventListener('click', e => {
			function isInside(x, y, element) {
				let elementPosX = element.getBoundingClientRect().left;
				let elementPosY = element.getBoundingClientRect().top;
				if (x > elementPosX && x < elementPosX + element.offsetWidth &&
					y > elementPosY && y < elementPosY + element.offsetHeight) {
					return true;
				};
				return false;
			}

			let openedLevels = this.openedSublevels.slice();
			//prepend the first level manually because it's not included in the `this.openedSublevels` array.
			openedLevels.unshift(this.globalContainer.querySelectorAll('.' + style.LEVEL)[0]);
			//check if click is on the setting target element itself
			if (isInside(e.clientX, e.clientY, this.button)) return;
			for (let level of openedLevels) if (isInside(e.clientX, e.clientY, level)) return;

			this._close();
			for (let i = 0; i < this.openedSublevels.length; i++) this._closeSublevel(this.openedSublevels[i]);
			this.button.classList.remove(style.CONTROL_BUTTON_CLICKED);


		});

	}

	_traverseAndBuild(currentNode, currentContainer, depth = 0) {
		let level = document.createElement('div');
		level.className = style.LEVEL;
		currentContainer.append(level)
		for (let category of currentNode) {
			let item = document.createElement('div');
			item.classList.add(style.ITEM);
			if (depth === this.levelsCount - 1) item.classList.add(style.ITEM_LEAF);
			if (category.hasOwnProperty('subcategories')) if (category['subcategories'].length > 0) item.classList.add(style.ITEM_WITH_SUBLEVELS);
			this.localInstances.set(item, { 'clicked': false });
			item.innerHTML = category['properties']['name'];
			item.setAttribute('data-id', category['id']);
			item.setAttribute('data-name', category['properties']['name']);
			item.addEventListener('click', (e) => {
				if (depth < this.levelsCount - 1) {
					let subLevel = item.nextElementSibling;
					let clicked = this.localInstances.get(item)['clicked'];
					if (subLevel) {
						for (let i = 0; i < this.openedSublevels.length; i++) {
							//if `item` and `sublevel` are siblings, revert
							if (subLevel.parentNode == this.openedSublevels[i].parentNode) {
								for (let j = i; j < this.openedSublevels.length; j++) this._closeSublevel(this.openedSublevels[j]);
								this.openedSublevels.splice(i, this.openedSublevels.length);
								this.selectedChain.splice(i, this.selectedChain.length);
								break;
							}
						}
						// console.log(subLevel.children)
						if (subLevel.children[0].tagName === 'DIV') { //FIXEME throws error: subLevel.chhildren is empty. Should it be?
							if (clicked) {
								subLevel.style.display = "none";
							} else {
								subLevel.style.left = item.closest('.' + style.LEVEL).offsetWidth + 'px';
								subLevel.style.top = item.getBoundingClientRect().top - subLevel.parentNode.getBoundingClientRect().top - 3 + 'px';
								subLevel.style.display = "initial";
								this.openedSublevels.push(subLevel);
								this.selectedChain.push(item);
							}
							this.localInstances.set(item, { 'clicked': !clicked });
						}
					}
					//leaf selected
				} else {
					if (this.leafSelected) this.target.querySelector('.' + style.DUMMY_INPUT).remove();
					this.selectedChain.push(item);
					let chains = this.buildChains(this.selectedChain);

					this.dummyInput.value = chains.idsChain;
					this.dummyInput.tabIndex = 0;
					this.button.innerHTML = chains.namesChain;

					this._close();
					this.leafSelected = true;
					this.button.classList.remove(style.NOT_SELECTED);

				}

			});
			level.append(item);
			if (category.hasOwnProperty('subcategories')) {
				if (category['subcategories'].length > 0) {
					let li = document.createElement('span');
					li.className = style.LEVEL_CONTAINER;
					level.append(li);
					li.style.display = "none";
					this._traverseAndBuild(category['subcategories'], li, depth + 1);
				}
			}
		}
	}

	_close() {
		this.globalContainer.remove();
		this.opened = false;
		this.selectedChain = [];
	}

	_closeSublevel(subLevel) {
		subLevel.style.display = "none";
		this.localInstances.set(subLevel.previousSibling, { 'clicked': false });
	}

	// Public Methods
	// --------------------------------------------------------


	revertSetting() {
		this.dummyInput.value = "";
		this.button.innerHTML = this.placeholder;
		this.button.classList.add(style.NOT_SELECTED);
	}


	buildChains(itemsArray) {
		let idsChain = "";
		let namesChain = "";
		for (let item of itemsArray) {
			idsChain += item.getAttribute('data-id') + '-';
			namesChain += "<span class=\"" + style.NAMES_CHAIN_ITEM + "\">" + item.getAttribute('data-name') + "</span>" + ' - ';
		}
		idsChain = idsChain.substring(0, idsChain.length - 1);
		namesChain = namesChain.substring(0, namesChain.length - 2);
		return { idsChain, namesChain };
	}






}