const UIBuilder = require('../index').UIBuilder;
const uiCache = require('../index').uiCache;

const misc = require('../../../../common/scripts/misc');
const ComponentElement = require('../components/ComponentElement');
const UIComponentModal = require('../components/UIComponentModal');
const COMPONENTS_INSTANCES = require('../index').COMPONENTS_INSTANCES;

const DELIMITER = "-";

module.exports = (_super, callback) => {

	let data;

	misc.xhr(null, 'GET', _super.contentURL, (res) => {
		uiCache.update('/api/dashboard/products/categories', res);
		data = res.PAYLOAD;
		let currentIndexPath = [];

		let currentIdPath = [];
		function onDbClickDo(row, indexPath) {
			currentIdPath.push(row.dataset.id);
			_super.contentURL = "/api/dashboard/products/categories?chain=" + currentIdPath.join(DELIMITER);
			_super.rebuild();
			if (currentIdPath.length > 0) buttonBack.removeAttribute('disabled');
		}

		//TODO: Make it express middleware style:
		/* e.g. componentExtender.on('rowBuild',(trElement, rowData)=>{
				})
		*/

		function _createChain(keyPath, delimiter, data, indexPath, modifyCallback) {
			let f = modifyCallback;
			if (!f) f = (s) => { return s };
			function getValueDotNotation(o, s) { return s.split('.').reduce((accumulator, currentValue) => accumulator[currentValue], o); }
			let chain = "";
			let currentParentCategory = data;
			for (let categoryIndex of indexPath) {
				chain += f(getValueDotNotation(currentParentCategory[categoryIndex], keyPath)) + delimiter;
				currentParentCategory = currentParentCategory[categoryIndex].subcategories;
			}
			chain = chain.substring(0, chain.length - 1); //remove last delimiter
			return chain;
		}

		function onBuildRowDo(trElement, rowData) {
			trElement.dataset.id = rowData.id;
			trElement.dataset.name = rowData.properties.name;
			if (!rowData.subcategories) trElement.dataset.notDbClickable = false;
			trElement.dataset.level = _super.currentIndexPath.length;
			for (let content in rowData.properties) {
				if (content !== 'urlName') {
					trElement.innerHTML += '<td>' + '<span class="tdContent">' + rowData.properties[content] + '</span>' + '</td>';
				}
			}
			//Last column for subcategories count
			trElement.innerHTML += '<td>' + '<span class="tdContent">' + (rowData.subcategories ? rowData.subcategories.length : '---') + '</span>' + '</td>';
		}

		let buttonAddCategory = new ComponentElement('button', 'Add new here', {
			attributes: {
				'data-table-action': 'addCategory',
				'type': 'button'
			},
			classList: ['UI-Button-TableButton']

		}, {
			'click': e => {
				let modal = new ComponentElement('x-UIComponent-Modal', null, {}, {}, true);
				modal.getInstance().setInnerHTML(/*html*/`
					<div class="section_title">
						<h2>Add new category:</h2> <span class="section_title_separator"></span>
					</div>
					<div class="section_content_description">
						<p>Lorem ipsum Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
							nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut
							wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit
							lobortis nisl ut aliquip ex ea</p>
					</div>
				`);

				let form = new ComponentElement('x-UIComponent-Form', null, {
					attributes: {
						'data-resource': 'products/categories/?action=create&chain=' + currentIdPath.join(DELIMITER),
						'data-form-id': 'addProduct',
						'data-close-modal-on-submit': ''
					}
				});
				let settingCategoryName = new ComponentElement('x-UIComponent-Form-Setting', null, {
					attributes: {
						'data-label': "Category Name",
						'data-type': "text",
						'data-name': "category-name",
						'data-content-id': "category-name",
						'data-opened': "",
						'data-setting-description': "Lorem ipsum Lorem ipsum dolor sit amet,consectetuer adipiscing elit."
					}
				}, null, false);
				form.append(settingCategoryName);
				form.instantiate();
				modal.getInstance().append(form.get());
				form.getInstance().setSubmitCallback((res, status, inputsValid) => {
					_super.rebuild(() => {
						//Get the entire categories tree again, because we ranamed maybe a subcategory and the cached contentUrl has url parameters
						//so the products table won't be able to retrieve the entire new cateogires tree.
						misc.xhr(null, 'GET', '/api/dashboard/products/categories', (resCategories) => {
							uiCache.update('/api/dashboard/products/categories', resCategories);
							COMPONENTS_INSTANCES.get(document.querySelector('x-UIComponent-Table[data-component-id="table-products-general"]')).rebuild();
						});
					});
				});
			}
		});

		let buttonDeleteCategory = new ComponentElement('button', 'Delete', {
			attributes: {
				'data-table-action': 'addCategory',
				'type': 'button'
			},
			classList: ['UI-Button-TableButton']

		}, {
			'click': e => {
				for (let row of _super.state.selectedRows) {
					misc.xhr({ 'id': row.dataset.id }, 'POST', '/api/dashboard/products/categories/?action=delete&chain=' + currentIdPath.join(DELIMITER), (res) => {
						if (res.HEADERS.STATUS_CODE === "NEED_CONFIRM") {
							let modal = new ComponentElement('x-UIComponent-Modal', null, {}, {}, true);
							modal.getInstance().setInnerHTML("<p> " + res.PAYLOAD + "</p>");
							let buttonYes = new ComponentElement('button', 'Yes', {
								attributes: {
									'type': 'button'
								},
								classList: ['UI-Button-TableButton']
							}, {
								'click': e => {
									misc.xhr({ 'id': row.dataset.id }, 'POST', '/api/dashboard/products/categories/?action=delete&chain=' + currentIdPath.join(DELIMITER) + '&confirmed=1', (res2) => {
										if (res2.HEADERS.STATUS_CODE === "OK") modal.getInstance().close();
									});
								}
							});

							let buttonNo = new ComponentElement('button', 'No', {
								attributes: {
									'type': 'button'
								},
								classList: ['UI-Button-TableButton']

							}, {
								'click': e => { modal.getInstance().close(); }
							});
							modal.append(buttonYes.get());
							modal.append(buttonNo.get());
						}
						_super.rebuild();
					});
				}
			}
		});


		let buttonRenameCategory = new ComponentElement('button', 'Rename', {
			attributes: {
				'data-table-action': 'renameCategory',
				'type': 'button'
			},
			classList: ['UI-Button-TableButton']

		}, {
			'click': e => {

				let modal = new ComponentElement('x-UIComponent-Modal', null, {}, {}, true);

				modal.getInstance().setInnerHTML(`
					<div class="section_title">
						<h2>Add new category:</h2> <span class="section_title_separator"></span>
					</div>
					<div class="section_content_description">
						<p>Lorem ipsum Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
							nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut
							wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit
							lobortis nisl ut aliquip ex ea</p>
					</div>
				`);

				let form = new ComponentElement('x-UIComponent-Form', null, {
					attributes: {
						'data-resource': 'products/categories/?action=rename&chain=' + currentIdPath.join(DELIMITER) + '&id=' + _super.state.selectedRows[_super.state.selectedRows.length - 1].dataset.id,
						'data-form-id': 'addProduct',
						'data-close-modal-on-submit': ''
					}
				});
				let settingCategoryName = new ComponentElement('x-UIComponent-Form-Setting', null, {
					attributes: {
						'data-label': "New Category Name",
						'data-type': "text",
						'data-name': "category-name",
						'data-content-id': "category-name",
						'data-opened': "",
						'data-setting-description': "Lorem ipsum Lorem ipsum dolor sit amet,consectetuer adipiscing elit."
					}
				}, null, false);
				form.append(settingCategoryName);
				form.instantiate();
				form.getInstance().setSubmitCallback((res, status, inputsValid) => {
					_super.rebuild(() => {
						//Get the entire categories tree again, because we ranamed maybe a subcategory and the cached contentUrl has url parameters
						//so the products table won't be able to retrieve the entire new cateogires tree.
						misc.xhr(null, 'GET', '/api/dashboard/products/categories', (resCategories) => {
							uiCache.update('/api/dashboard/products/categories', resCategories);
							COMPONENTS_INSTANCES.get(document.querySelector('x-UIComponent-Table[data-component-id="table-products-general"]')).rebuild();
						});
					});
				});
				modal.getInstance().append(form.get());
			}
		}).defineState('enabled', {
			attributes: {}
		}).defineState('disabled', {
			attributes: { 'disabled': '' }
		}).switchToState('disabled');

		let buttonBack = new ComponentElement('button', '← Back', {
			attributes: {
				'data-table-action': 'addCategory',
				'type': 'button'
			},
			classList: ['UI-Button-TableButton']

		}, {
			'click': e => {
				currentIdPath.pop();
				//TODO: Use switchToState.
				if (currentIdPath.length === 0) buttonBack.setAttribute('disabled', '');
				_super.contentURL = "/api/dashboard/products/categories?chain=" + currentIdPath.join(DELIMITER);
				_super.rebuild();
			}
		});


		let buttonViewProducts = new ComponentElement('button', 'View Products', {
			attributes: {
				'data-table-action': 'addCategory',
				'type': 'button'
			},
			classList: ['UI-Button-TableButton']
		}, {
			'click': e => {
				//creates e.g. id1,id2,id3-id4,id5-id6,id7,id8
				let urlParam = "";
				for (let i = 0; i < _super.state.selectedRows.length; i++) {
					let chain = currentIdPath.join(DELIMITER) + DELIMITER + _super.state.selectedRows[i].dataset.id;
					//Cuts leading DELIMITER:
					if (chain.charAt(0) === DELIMITER) chain = chain.substring(1);
					urlParam += chain + (i < _super.state.selectedRows.length - 1 ? DELIMITER : '');
				}

				let modal = new ComponentElement('x-UIComponent-Modal', null, {}, {}, true);
				let productsUrl = '/api/dashboard/products/getProducts/?chains=' + urlParam;
				misc.xhr(null, 'GET', productsUrl, (res) => {
					let currentCategoriesShowing = "";
					let delimiter = ", ";
					for (let row of _super.state.selectedRows) currentCategoriesShowing += row.dataset.name + delimiter;
					currentCategoriesShowing = currentCategoriesShowing.substring(0, currentCategoriesShowing.length - delimiter.length);
					modal.getInstance().setInnerHTML(`
						<div class="section_title">
							<h2>Products in: ${currentCategoriesShowing}</h2> <span class="section_title_separator"></span>
						</div>
						<div class="section_content_description">
							<p>Lorem ipsum Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
								nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut
								wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit
								lobortis nisl ut aliquip ex ea</p>
						</div>
					`);

					let dummyContentId = 'dummy-content-id-for-category-products-tble';
					let newTable = new ComponentElement('x-UIComponent-Table', null, {
						attributes: {
							'data-component-id': 'table-products-general',
							'data-content-id': dummyContentId,
							'data-content-url': productsUrl
						}
					}, null, true, { [dummyContentId]: res.PAYLOAD });
					modal.getInstance().append(newTable.get());
				});
			}
		}).defineState('enabled', {
			attributes: {}
		}).defineState('disabled', {
			attributes: { 'disabled': '' }
		}).switchToState('disabled');


		//FIXME: Change backend to support complex categories GETs with path in parameters!
		let buttonRefresh = new ComponentElement('button', 'Refresh', {
			attributes: {
				// 'data-table-action': 'clear',
				'type': 'button'
			},
			classList: ['UI-Button-TableButton']
		}, {
			'click': e => { _super.rebuild(); }
		});

		//Maybe use switchToState ?
		if (_super.currentIndexPath.length === 0) {
			buttonBack.setAttribute('disabled', '');
		}

		// let tableBreadcrumbs = document.createElement('span');
		// tableBreadcrumbs.innerHTML += _createChain('properties.name', '⯈', data, _super.currentIndexPath, s => {
		// 	return "<span style=\"margin-right: 5px; margin-left: 5px;\">" + s + "</span>";
		// });
		// tableBreadcrumbs.style.userSelect = "none";


		function onClickDo(row, isSelected) {
			if (!isSelected && _super.state.selectedRows.length === 0) buttonViewProducts.switchToState('enabled');
			else if (isSelected && _super.state.selectedRows.length === 1) { buttonViewProducts.switchToState('disabled'); }

			if (!isSelected && _super.state.selectedRows.length === 0) buttonRenameCategory.switchToState('enabled');
			else if (isSelected && _super.state.selectedRows.length === 1) { buttonRenameCategory.switchToState('disabled'); }
		}

		callback({
			onDbClickDo: onDbClickDo,
			onBuildRowDo: onBuildRowDo,
			onClickDo: onClickDo,
			data: data,
			tableButtons: {
				buttonBack: buttonBack,
				buttonAddCategory: buttonAddCategory,
				buttonDeleteCategory: buttonDeleteCategory,
				buttonViewProducts: buttonViewProducts,
				buttonRenameCategory: buttonRenameCategory,
				buttonRefresh: buttonRefresh
			},
			tableInfo: {
				// tableBreadcrumbs
			},
			thead: ['Name', 'Products Count', 'Subcategories Count'],
			currentIndexPath,
		});
	});
}