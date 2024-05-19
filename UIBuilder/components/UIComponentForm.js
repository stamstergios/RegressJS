const misc = require('../../../../common/scripts/misc');
const COMPONENTS_INSTANCES = require('../index').COMPONENTS_INSTANCES;
const ComponentElement = require('./ComponentElement');

class UIComponentForm {

	constructor(target, tagName) {
		// this
		this.currentPageID = require('../../ui').currentPageID; //i don't know why this only works here...
		this.target = target;
		this.wizardPagesCount = parseInt(this.target.getAttribute('data-wizard-form'));
		this.elements = this._build();
		this.method = this.target.getAttribute('data-method') || "POST";
		this.openedSettingsCount = 0;
		this.openedSettingsList = [];
		this.formId = this.target.getAttribute('data-form-id');
		this.currentlyUploading = false;
		this.uploadedAtLeastOnce = false;
		this.uploadSessionToken = "CREATE_NEW";
		this.formHasFileInputs = this.target.querySelectorAll('input[type="file"]').length > 0;
		this.extraBodyContent = null;
		this.submitCallback;
		this.submitSuccess = false;
	}

	getFormId() { return this.formId; }
	setSubmitCallback(f) { this.submitCallback = f; }

	getUploadSessionToken() { return this.uploadSessionToken; }
	setUploadSessionToken(token) { this.uploadSessionToken = token; }
	getUploadedAtLeastOnce() { return this.uploadedAtLeastOnce; }
	setUploadedAtLeastOnce(b) {
		if (typeof b !== 'undefined') {
			this.uploadedAtLeastOnce = b;
		} else {
			this.uploadedAtLeastOnce = true;
		}
	}
	setCurrentlyUploading(b) {
		this.currentlyUploading = b;
		if (b) {
			this.elements.buttonSubmit.switchToState('disabled');
		} else {
			this.elements.buttonSubmit.switchToState('default');
		}
	}

	append(node, wizardPageNo) {
		if (wizardPageNo) this.elements.wizardPages[wizardPageNo].append(node);
		else {
			if (this.wizardPagesCount > 0) this.elements.wizardPages[0].append(node); //default is adding it to first wizard page
			else this.elements.formSettingsContainer.append(node);
		}
	}

	setExtraBodyContent(o) { this.extraBodyContent = o; }

	cancel() {
		if (this.uploadedAtLeastOnce && this.submitSuccess !== true) {
			// console.log('submitSuccess',submitSuccess)
			misc.xhr({ 'form-id': this.formId, 'uploadSessionToken': this.uploadSessionToken }, 'POST', '/api/dashboard/cancelUpload/', (res_cancel, status_cancel) => {
				if (status_cancel == 200) {
					console.log(res_cancel);

				}
			}, null, 'JSON');
		}
	}

	_build() {

		// let section = document.createElement('section');
		let section = new ComponentElement('section', null, {});
		let settings = this.target.querySelectorAll('x-UIComponent-Form-Setting');

		//TODO: Hack. We use `x-UIComponent-Container` elements as wrappers for html that we want to insert inside the form component.
		//Ideally, everything should be an `x-UIComponent-Form-Setting`.
		let components = this.target.querySelectorAll('x-UIComponent-Form-Setting, x-UIComponent-Container');
		
		// let form = document.createElement('form');
		let form = new ComponentElement('form', null, {});
		let formSettingsContainer = document.createElement('div'); //TODO: remove and add one in every wizard page

		let wizardPages = [];
		let currentWizardPageIndex = 0;


		let formButtons = new ComponentElement('div', null, {});
		formButtons.defineState('show', {
			style: {
				'display': 'inline-block'
			}
		}).defineState('hide', {
			style: {
				'display': 'none'
			}
		}).switchToState('hide');

		let buttonSubmit = new ComponentElement('button', 'Save', {
			classList: ['form_button'],
			attributes: {
				'type': 'submit'
			}
		}).defineState('disabled', {
			classList: ['form_button_disabled'],
			attributes: {
				'disabled': ''
			}
		});

		let buttonUndo = new ComponentElement('button', "Cancel", {
			classList: ["form_button", "form_undo_button"],
			attributes: {
				'type': 'button',
				'value': 'Save'
			},
			style: {
				'display': 'inline-block'
			}
		}, {
			'click': e => {
				this.openedSettingsList = [];
				for (let setting of settings) COMPONENTS_INSTANCES.get(setting).revertSetting();
				this.openedSettingsCount = 0;
				this.cancel();
				//TODO: create a function to do both of these
				this.uploadSessionToken = "CREATE_NEW";
				this.uploadedAtLeastOnce = false;
				/////////////////////////////////////////////
				formButtons.switchToState('hide');
			}
		});

		formButtons.append(buttonSubmit);
		formButtons.append(buttonUndo);

		let statusContainer = document.createElement('div');
		statusContainer.classList.add('form_status_container');

		let statusLoadingContainer = document.createElement('div');
		statusLoadingContainer.classList.add('loading_container');
		statusContainer.append(statusLoadingContainer);

		let loadingImg = document.createElement('img');
		loadingImg.setAttribute('src', './loading.svg');
		statusLoadingContainer.append(loadingImg);

		formButtons.append(statusContainer);

		// Only add the "Save"/"Undo" buttons if the form ISN'T a wizard form
		// if (!this.wizardPagesCount) {
		// }

		if (this.wizardPagesCount) {

			//Disable `Enter` key because it may fire when on a random wizard page.
			window.addEventListener('keydown', (e_window) => { if (e_window.key === 'Enter') e_window.preventDefault(); });

			for (let i = 0; i < this.wizardPagesCount; i++) {

				let wizardPageContainer = new ComponentElement('div', null, {
					attributes: {
						'data-wizardPage-id': i
					},
					classList: ['form_wizardPagecontainer']
				}).defineState('hidden', {
					classList: ['form_wizardPagecontainer_hidden']
				});

				let wizardPageSettingsContainer = new ComponentElement('div', null, {
					classList: ['form_wizardPageSettingsContainer']
				});
				wizardPageContainer.append(wizardPageSettingsContainer);

				if (i > 0) wizardPageContainer.switchToState('hidden');

				form.append(wizardPageContainer);
				wizardPages.push(wizardPageContainer);
			}

			let wizardPageButtonsContainer = new ComponentElement('div', null, {
				classList: ['form_wizardPageButtonsContainer']
			});
			form.append(wizardPageButtonsContainer);

			let buttonPrevPage = new ComponentElement('button', 'Back', {
				attributes: {
					'type': 'button'
				},
				classList: ['form_button', 'form_wizardPageButtonBack'],
			}, {
				'click': () => {
					let index = currentWizardPageIndex;
					if (index - 1 === 0) buttonPrevPage.switchToState('hidden');
					if (index <= this.wizardPagesCount - 1) buttonNextPage.switchToState('default');
					else buttonNextPage.switchToState('hidden');
					wizardPages[index].switchToState('hidden');
					wizardPages[index - 1].switchToState('default');

					//The target element (i.e. <form> element) will be dispatched an event called `pageleave` along with the appropriate direction
					this.target.dispatchEvent(new CustomEvent('pageleave', { detail: { 'direction': 'back', 'currentPageIndex': currentWizardPageIndex } }));

					currentWizardPageIndex--;
					if (currentWizardPageIndex < this.wizardPagesCount - 1) formButtons.switchToState('hide');
				}
			}).defineState('hidden', {
				attributes: {
					'hidden': ''
				},
				style: {
					'display': 'none'
				}
			}).switchToState('hidden');
			console.log(buttonPrevPage)

			wizardPageButtonsContainer.append(buttonPrevPage);

			let buttonNextPage = new ComponentElement('button', 'Next', {
				attributes: {
					'type': 'button'
				},
				classList: ['form_button', 'form_wizardPageButtonNext']
			}, {
				'click': () => {
					let index = currentWizardPageIndex;
					if (index + 1 >= 0) buttonPrevPage.switchToState('default');
					if (index + 1 === this.wizardPagesCount - 1) buttonNextPage.switchToState('hidden');
					else buttonNextPage.switchToState('default');
					wizardPages[index].switchToState('hidden');
					wizardPages[index + 1].switchToState('default');

					//The target element (i.e. <form> element) will be dispatched an event called `pageleave` along with the appropriate direction
					this.target.dispatchEvent(new CustomEvent('pageleave', { detail: { 'direction': 'forward', 'currentPageIndex': currentWizardPageIndex } }));

					currentWizardPageIndex++;
					if (currentWizardPageIndex === this.wizardPagesCount - 1) {
						buttonNextPage.switchToState('hidden');
						formButtons.switchToState('default');
					}

				}
			}).defineState('hidden', {
				attributes: {
					'hidden': ''
				}, style: {
					'display': 'none'
				}
			});
			wizardPageButtonsContainer.append(buttonNextPage);
			formButtons.switchToState('hide');
			wizardPageButtonsContainer.append(formButtons);
		} else {
			form.append(formSettingsContainer);
			form.append(formButtons);
		}

		//----- Add settings
		for (let c of components) {
			if (c.getAttribute('data-wizard-page')) wizardPages[parseInt(c.getAttribute('data-wizard-page'))].append(c);
			else {
				if (this.wizardPagesCount > 0) wizardPages[0].append(c); //default add to first fwizard page
				else formSettingsContainer.append(c);
			}
		}



		form.addEventListener('submit', (e) => {
			statusLoadingContainer.style.display = "inline-block";
			e.preventDefault();
			let url;
			if (this.target.getAttribute('data-resource')) url = '/api/dashboard/' + this.target.getAttribute('data-resource');
			else url = '/api/dashboard/submit';

			//TODO: change to  body = {[this.formId] : misc.formToUrlObject(form)};
			let body;
			if (this.method.toUpperCase() === 'POST') {
				if (this.formHasFileInputs) {
					body = {
						'form-id': this.formId,
						'uploadSessionToken': this.uploadSessionToken,
						'inputs': misc.formToUrlObject(form)
					};
				} else {
					body = {
						'inputs': misc.formToUrlObject(form)
					};
				}

				Object.assign(body, this.extraBodyContent);
				//FIXME: GET with body???
			} else if (this.method.toUpperCase() === 'GET') {
				body = misc.formToUrlObject(form);
				Object.assign(body, this.extraBodyContent);

			}
			// console.log(body);
			// let formDataDragAndDrop = [];
			// for (let setting of settings) {
			// 	if (setting.querySelector('input[type="file"]')) {
			// 		formDataDragAndDrop.push({
			// 			'name': setting.querySelector('input[type="file"]').getAttribute('name'),
			// 			'files': COMPONENTS_INSTANCES.get(setting).getDragAndDropFiles()
			// 		});
			// 	}
			// };


			// console.log(formDataDragAndDrop);
			// if (!setting.querySelector('input[type="file"]')) {
			misc.xhr(body, this.method, url, (res, status) => {
				statusLoadingContainer.style.display = "none";
				form.blur();
				let allInputsValid = true;
				misc.deepCompare(body, res.HEADERS.BOOLEANS, (key, valid) => {
					let currentInput = this.target.querySelector('input[name="' + key + '"]');
					if (!valid) {
						currentInput.classList.add('input_invalid');
						allInputsValid = false;
					}
				});
				if (this.submitCallback) this.submitCallback(res, status, allInputsValid);
				if (allInputsValid) {
					//Now send all the files if there's file inputs present.
					// if (settings.querySelector('input[type="file"]')) {
					// 	for (let setting of settings) {
					// 		if (COMPONENTS_INSTANCES.get(setting).getInputType() === 'file') {
					// 			let currentFiles = COMPONENTS_INSTANCES.get(setting).getFiles();
					// 			for (let file of currentFiles) {
					// 				let formData = new FormData();
					// 				formData.append('name', COMPONENTS_INSTANCES.get(setting).getName());
					// 				formData.append('file', file);
					// 				misc.xhr(formData, 'POST', '/api/dashboard/upload', (res_upload, status_upload) => {
					// 					console.log('From upload: ', res_upload, status_upload);
					// 				}, (e_progress) => { COMPONENTS_INSTANCES.get(setting).onProgress(e_progress); });
					// 			}
					// 		}
					// 	}
					// }
					//Update page content
					// console.log(8678687868)
					if (status === 200) this.submitSuccess = true;
					if (status === 200 && this.target.getAttribute('data-close-modal-on-submit') === '') COMPONENTS_INSTANCES.get(this.target.closest('x-UIComponent-Modal')).close(true);

					misc.xhr({ "p": this.currentPageID }, 'GET', '/api/dashboard/getPage/', (res_newPageContent) => {
						for (let setting of settings) {
							if (this.openedSettingsCount > 0) this.openedSettingsCount--;
							COMPONENTS_INSTANCES.get(setting).updateSetting(res_newPageContent.PAYLOAD[setting.getAttribute('data-name')]);
						}
						formButtons.switchToState('hide');
					});
				}
			}, null, 'JSON');
			// } else {
			let filesToSend = [];
			// let nonFileInputs = { 'nonFileInputs': misc.formToUrlObject(form) };
			// misc.xhr(nonFileInputs, 'POST', url, (res,status)=>{

			// });


			// for (let setting of settings) {
			// 	if (COMPONENTS_INSTANCES.get(setting).getInputType() === 'file') {
			// 		let currentFiles = COMPONENTS_INSTANCES.get(setting).getFiles();
			// 		for (let file of currentFiles) {
			// 			filesToSend.push({
			// 				'name': COMPONENTS_INSTANCES.get(setting).getName(),
			// 				'file': file
			// 			});

			// 		}
			// 	}
			// }
			// }
		});

		section.append(form);

		this.target.addEventListener('_setting_opened', (e) => {
			if (this.openedSettingsCount === 0) showFormButtons();
			this.openedSettingsCount++;
		});

		this.target.addEventListener('_setting_closed', (e) => {
			this.openedSettingsCount--;
			if (this.openedSettingsCount === 0) hideFormButtons();
		});

		this.target.append(section.element); //must get rid off .get(). We keep it becaue this.target is not a ComponenElement

		let isWizardForm = this.wizardPagesCount;
		function showFormButtons() { if (!isWizardForm) formButtons.switchToState('show'); else return; }
		function hideFormButtons() { if (!isWizardForm) formButtons.switchToState('hide'); else return; }
		return { buttonSubmit, form, formSettingsContainer, wizardPages };
	}
}

module.exports = UIComponentForm;