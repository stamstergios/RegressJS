// const UIBuilder = require('../index').UIBuilder;
const misc = require('../../../../common/scripts/misc');
const ComponentElement = require('./ComponentElement');
const COMPONENTS_INSTANCES = require('../index').COMPONENTS_INSTANCES;
const uiCache = require('../index').uiCache;
const escapeStack = require('../index').escapeStack;

class UIComponentTable {

	constructor(target, tagName, data = null) {
		this.target = target;
		this.configs;
		this.currentIndexPath = [];
		// this.vars = {};
		this.searchType = this.target.getAttribute('data-search-type');
		this.state = {};
		this.placeholder = document.createElement('div');
		this.placeholder.classList.add('placeholder');
		this.placeholder.innerHTML = '<img src="./loading.svg">'
		// this.placeholder.style.
		this.target.append(this.placeholder);
		this.contentURL = this.target.getAttribute('data-content-url');
		this.inSearch = false;
		this.previousSearchQuery = "";
		//TODO: if data is provided, skip the request in this.configs

		//---Important!---
		//This is essentially a custom `extends` mechanism. Since we want to create an object asynchronously (e.g. after making a request for data),
		//it is not possible to use the native inheritance mechanism because we cannot call `super` asynchronusly in the derived class.
		//(I have tried. See: https://stackoverflow.com/questions/43431550/async-await-class-constructor)
		//We use a builder method instead (in this case `_build`), just as we do on all the components.
		require('../componentsConfigs/' + this.target.getAttribute('data-component-id'))(this, (configs) => {
			this.placeholder.style.display = "none";
			//Guards
			if (typeof configs.onBuildRowDo === 'undefined') configs.onBuildRowDo = () => { return; };
			if (typeof configs.onDbClickDo === 'undefined') configs.onDbClickDo = () => { return; };
			if (typeof configs.onClickDo === 'undefined') configs.onClickDo = () => { return; };
			if (typeof configs.onBuildAllRowsDo === 'undefined') configs.onBuildAllRowsDo = () => { return; };

			this.data = data || configs.data;
			this.configs = configs;
			this.elements = this._build(configs);

		});
	}

	//FIXME: When the table is created using external data (i.e. a request is not performed in this.configs),
	//		 we need to rebuildUsing the url of the data it was created with!
	rebuild(afterRebuildCallback) {
		if (this.contentURL) {
			misc.xhr(null, 'GET', this.contentURL, (res) => {
				uiCache.update(this.contentURL, res);
				this.data = res.PAYLOAD;
				this.target.innerHTML = null;
				this._build(this.configs);
				if (afterRebuildCallback) afterRebuildCallback();
			});
		}
	}

	_build(configs) {

		this.localInstances = new Map();
		this.state = {
			'selectedRows': []
		};

		let tableContainer = new ComponentElement('div', null, { classList: ['tableContainer'] });

		let menu = new ComponentElement('div', null, { classList: ['tableContainerMenu'] }).appendTo(tableContainer);

		let menuLeft = new ComponentElement('div', null, { classList: ['tableContainerMenuLeft'] }).appendTo(menu);

		let menuRight = new ComponentElement('div', null, { classList: ['tableContainerMenuRight'] }).appendTo(menu);

		// let test;
		// let elements = test.appendDOMDescription(/*html*/`
		// 	<div$menu class="test123">
		// 		<div$menuLeft class="tableContainerMenuLeft"></div>
		// 		<div$menuRight class="tableContainerMenuRight"></div>

		// 	</div>
		
		// `);
		// elements.menuLeft.appned(/*...*/)

		// let pInfo = document.createElement('p');
		// pInfo.innerHTML = 'Selected products: ';
		// let spanInfo = document.createElement('span');
		// spanInfo.setAttribute('data-table-info', 'selectionSize');
		// spanInfo.innerHTML = 0;
		// pInfo.append(spanInfo);
		// tableContainer.append(pInfo);

		for (let tableButton in this.configs.tableButtons) menuLeft.append(configs.tableButtons[tableButton]);
		for (let info in this.configs.tableInfo) menuLeft.append(this.configs.tableInfo[info]);

		if (this.searchType) {

			let searchBarContainer = new ComponentElement('div', null, { style: { 'display': 'inline-block' } });

			let form = new ComponentElement('x-UIComponent-Form', null, {
				attributes: {
					'data-resource': 'search',
					'data-method': 'GET'
					// 'data-form-id': 'addProduct'
				}
			}, null, false);
			let form_searchBar = new ComponentElement('x-UIComponent-Form-Setting', null, {
				attributes: {
					'data-type': "search",
					'data-name': "q",
					'data-value': this.previousSearchQuery,
					// 'data-content-'
					'data-label': "Search",
					'data-opened': ''

				}
			}, null, false);

			let buttonExitSearch = new ComponentElement('button', 'Exit Search', {
				classList: ['UI-Button-TableButton'],
				attributes: {
					'type': 'button'
				}
			}, {
				'click': e => {
					this.inSearch = false;
					buttonExitSearch.switchToState('hidden');
					this.previousSearchQuery = "";
					this.rebuild();
				}
			}).defineState('hidden', {
				classList: ['UI-Button-TableButton-Hidden']
			}).switchToState('hidden');
			if (this.inSearch) buttonExitSearch.switchToState('default');
			menuRight.append(buttonExitSearch);

			form.append(form_searchBar);
			form.instantiate();
			form.getInstance().setExtraBodyContent({ 'type': this.searchType });
			form.getInstance().setSubmitCallback((resSearch, statusSearch, allInputsValid) => {
				//TODO!: Use getValue() on the ComponentElement instance. For this, we must RETROACTIVELY
				//add the instance to the ComponentElement instance when instantiating recursively like in this case with form elements.
				this.previousSearchQuery = form_searchBar.querySelector('input').value;
				this.data = resSearch.PAYLOAD;
				this.target.innerHTML = null;
				this.inSearch = true;
				this._build(this.configs);
			});
			searchBarContainer.append(form);
			menuRight.append(searchBarContainer);
		}

		let table = document.createElement('table');
		let thead = document.createElement('thead');
		for (let colName of this.configs.thead) {
			let th = document.createElement('th');
			th.innerText = colName;
			th.setAttribute('data-th-name', colName);
			thead.append(th);
		}
		table.append(thead);
		this._addSortingButtons(table);
		let tbody = document.createElement('tbody');
		table.append(tbody);
		tableContainer.append(table);
		if (this.data) if (this.data.length > 0) this._buildTableFromArray(tbody, this.data, configs);
		else tbody.innerHTML = "<td style=\" text-align: center; padding: 20px;\" colspan=" + this.configs.thead.length + "> No Products Found </td>";
		this.target.append(tableContainer.element);
		this.configs.onBuildAllRowsDo(tbody);
		return { tbody };
	}

	updateSetting(newValue) {
		if (newValue) {
			if (newValue.length > 0) {
				this._buildTableFromArray(this.elements.tbody, newValue);
				this.configs.onBuildAllRowsDo(this.elements.tbody);
			}
			else this.elements.tbody.innerHTML = "<td style=\" text-align: center; padding: 20px;\" colspan=" + this.configs.thead.length + "> No Products Found </td>";
		} else {
			this.elements.tbody.innerHTML = "<td style=\" text-align: center; padding: 20px;\" colspan=" + this.configs.thead.length + "> No Products Found </td>";
		}
	}

	_buildTableFromArray(tbody, array) {
		tbody.innerHTML = "";
		this.state.selectedRows = [];
		let index = 0;
		for (let rowData of array) {
			let trElement = document.createElement('tr');

			// trElement.setAttribute('data-product-sku', row.properties.sku);
			trElement.classList.add('productsTableRow');
			if (this.configs.onBuildRowDo) this.configs.onBuildRowDo(trElement, rowData);

			trElement.dataset.index = index;


			this.localInstances.set(trElement, {
				isSelected: false,
				isDbClicked: false,
				index: index,
				data: { ...rowData.properties }
			});

			if (trElement.dataset.notDbClickable === undefined) {
				trElement.addEventListener('dblclick', (e) => {
					// let currentRow = e.target.closest('tr');
					// let dbClicked = this.localInstances.get(trElement).isDbClicked;
					// if (!dbClicked) {
					// 	this.currentIndexPath.push(parseInt(this.localInstances.get(trElement).index));
					// 	currentRow.classList.add('productsTableRow_Selected');
					// 	let newRowContent = this.configs.onDbClickDo(trElement, this.currentIndexPath);
					// 	if (newRowContent) currentRow.after(newRowContent);
					// } else {
					// 	this.currentIndexPath.pop();
					// 	currentRow.classList.remove('productsTableRow_Selected');
					// 	currentRow.nextSibling.remove(); //add guards for calls like that check for specific class etc
					// }
					let dbClicked = this.localInstances.get(trElement).isDbClicked;
					this.configs.onDbClickDo(trElement, this.currentIndexPath, dbClicked);
					this._updateMapObjectValue(this.localInstances, trElement, { 'isDbClicked': !dbClicked });
				});
			}

			trElement.addEventListener('click', (e) => {
				misc.deselect();
				let currentRow = e.target.closest('tr');
				this.configs.onClickDo(currentRow, this.localInstances.get(currentRow).isSelected);
				if (!this.localInstances.get(currentRow).isSelected && this.state.selectedRows.length === 0) escapeStack.push(this);

				//this implements windows explorer-like selection behavior
				if (this.localInstances.get(currentRow).isSelected) {
					if (this.state.selectedRows.length > 1) {
						if (e.ctrlKey) {
							this._deselect(currentRow);
							this.state.selectedRows.splice(this.state.selectedRows.indexOf(currentRow), 1);
						} else {
							for (let previouslySelectedRow of this.state.selectedRows) { this._deselect(previouslySelectedRow); }
							this.state.selectedRows = [];
							this.state.selectedRows.push(currentRow);
							this._select(currentRow);
						}
					} else {
						this._deselect(currentRow);
						this.state.selectedRows = [];
					}
				} else {
					//FIXME: Sorting the table breaks the selection mecahanisms!!!!! ==============================================================
					//FIXME: Shift selecting new rows moves the entire selection upwards or downwards. Maybe store the direction somewhere?
					if (!e.ctrlKey && !e.shiftKey && this.state.selectedRows.length > 0) {
						for (let previouslySelectedRow of this.state.selectedRows) { this._deselect(previouslySelectedRow); }
						this.state.selectedRows = []
						this.state.selectedRows.push(currentRow);
						this._select(currentRow);
					} else if (!e.shiftKey || (e.shiftKey && this.state.selectedRows.length === 0)) {
						this._select(currentRow);
						this.state.selectedRows.push(currentRow);
					} else {
						let startRow = this.state.selectedRows[this.state.selectedRows.length - 1];
						if (this.state.selectedRows.length > 1) {
							for (let i = 0; i < this.state.selectedRows.length - 1; i++) this._deselect(this.state.selectedRows[i]);
							this.state.selectedRows = [];
							this.state.selectedRows.push(startRow);
						}
						let start = parseInt(startRow.dataset.index);
						let end = parseInt(trElement.dataset.index);
						if (end < start) {
							[start, end] = [end, start];
							end = end - 1;
						} else {
							start = start + 1;
						}
						for (let i = start; i <= end; i++) {
							let inbetweenRow = trElement.parentNode.querySelector('[data-index="' + i + '"]');
							this.state.selectedRows.push(inbetweenRow);
							this._select(inbetweenRow);
						}
					}
				}
				// tableParent.querySelector('[data-table-info="selectionSize"]').innerText = this.state.selectedRows.length;
			});

			// document.addEventListener('keydown', e => {
			// 	if (e.key === 'Escape') {
			// 		for (let i = 0; i < this.state.selectedRows.length; i++) this._deselect(this.state.selectedRows[i]);
			// 		this.state.selectedRows = [];
			// 	}
			// });

			tbody.appendChild(trElement);
			index++;
		}
	}

	escHandler() {
		for (let i = 0; i < this.state.selectedRows.length; i++) this._deselect(this.state.selectedRows[i]);
		this.state.selectedRows = [];
	}

	_select(row) {
		row.classList.add('rowSelected');
		this._updateMapObjectValue(this.localInstances, row, { isSelected: true });

	}
	_deselect(row) {
		this._updateMapObjectValue(this.localInstances, row, { isSelected: false });
		row.classList.remove('rowSelected');
	}

	_addSortingButtons(table) {
		let columnTitles = table.querySelector('thead').querySelectorAll('th');
		for (let i = 0; i < columnTitles.length; i++) {
			columnTitles[i].dataset.direction = 1; //custom	
			columnTitles[i].addEventListener('click', e => {
				let tableBody = table.querySelector('tbody');
				//FIXME: Nested tables td become children of the root array when clicking a column to sort
				//Maybe use a more specific selector and not tr...
				let rows = tableBody.querySelectorAll('tr');
				let rowsArray = [];
				for (let j = 0; j < rows.length; j++) rowsArray.push(rows[j]);
				rowsArray.sort((a, b) => {
					let aString = a.children[i].textContent;
					let bString = b.children[i].textContent;
					let comparison;
					//check if string is a number
					if (b.children[i].textContent.match(/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/)) comparison = parseFloat(aString) - parseFloat(bString);
					else comparison = aString.localeCompare(bString);
					return columnTitles[i].dataset.direction * comparison;
				});
				for (let row of rowsArray) {
					tableBody.appendChild(row);
				}
				columnTitles[i].dataset.direction *= -1;
			});
		}
	}

	_updateMapObjectValue(map, mapKey, newValues) {
		map.set(mapKey, { ...map.get(mapKey), ...newValues });
	}
}

module.exports = UIComponentTable;