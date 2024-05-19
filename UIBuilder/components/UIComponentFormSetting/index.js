const misc = require('../../../../../common/scripts/misc');
const COMPONENTS_INSTANCES = require('../../index').COMPONENTS_INSTANCES;
const uiCache = require('../../index').uiCache;
const NamesChainStringBuilder = require('../../common').NamesChainStringBuilder;

const TreeSelect = require('./TreeSelect');
const ImagePreview = require('./ImagePreview');
const ComponentElement = require('../ComponentElement');

class UIComponentFormSetting {

	constructor(target, tagName, data = null) {
		this.data = data;
		this.target = target;
		this.beingEdited = false;
		this.formIndex;
		this.value = this.target.getAttribute('data-value');
		this.settingDescription = this.target.getAttribute('data-setting-description');
		this.openedDefault = this.target.getAttribute('data-opened') === '';
		this.inputType = this.target.getAttribute('data-type');
		this.name = this.target.getAttribute('data-name');
		this.files = [];
		this.onprogress;
		this.localInstances = [];
		this.treeselectContentURL = this.target.getAttribute('data-treeselect-url');
		this.treeselectContentLevels = parseInt(this.target.getAttribute('data-treeselect-levels'));
		this.treeselectPlaceholderIds = this.target.getAttribute('data-treeselect-placeholder-ids');
		this.childInputsPreffix = this.target.getAttribute('data-child-inputs-preffix');
		this.imagesShownCount = 0;
		this.currentFileBatchCount = 0;

		//Used for multiple file inputs per <form>
		this.uploadEntityId = this.target.getAttribute('data-upload-entity-id');
		// this.placeholder = this.target.getAttribute('data-placeholder');

		if (typeof this.childInputsPreffix !== 'undefined' && this.childInputsPreffix != null) {
			this.dummyInputForPrimaryImage = document.createElement('input');
			this.dummyInputForPrimaryImage.type = 'hidden';
			this.dummyInputForPrimaryImage.name = this.childInputsPreffix + 'primaryImage';
			this.target.append(this.dummyInputForPrimaryImage);
		}

		this.elements = this._build();
		// this.parentFormInstance = 
	}


	_showImages(fileList, imagesArea) {
		this.elements.uploadStatus.switchToState('visible');

		let filesCopy = [];
		for (let file of fileList) filesCopy.push(file);

		this.elements.uploadTotalNumber.innerHTML = fileList.length;
		this.currentFileBatchCount = fileList.length;

		this._previewImages(filesCopy, imagesArea, fileList.length, () => {
			this.elements.uploadStatus.switchToState('default');
			console.log('Images done')
		});
	}

	_build() {

		// if(this.openedDefault){
		// 	console.log('success')
		// 	this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_opened'));
		// }
		let labelItem = document.createElement('div');
		labelItem.classList.add('label_item');

		if (this.target.getAttribute('data-type') === 'treeselect') { //CUSTOM `input` controls
			if (typeof this.treeselectContentLevels === 'undefined' || typeof this.treeselectContentURL === 'undefined') {
				console.error('panotea-UIComponentFormSetting: Setting components of type `treeselect` MUST also have `data-treeselect-url` and `data-treeselect-levels` attributes set.');
			} else {
				let label = document.createElement('label');
				label.classList.add('label_set');
				label.innerText = this.target.getAttribute('data-label') + ':';
				labelItem.append(label);
				uiCache.try(this.treeselectContentURL, (res, status) => {
					this.localInstances.push(new TreeSelect(label, res.PAYLOAD, this.name, this.treeselectContentLevels, this.treeselectPlaceholderIds ? this.treeselectPlaceholderIds.split(',') : null));
					this.target.append(labelItem);
				});
			}
		} else { //DEFAULT `input` controls

			let label = document.createElement('label');
			label.classList.add('label_set');
			label.innerText = this.target.getAttribute('data-label') + ':';
			// -----------------------------------------------------------

			let input = document.createElement('input');
			input.classList.add('testing');
			if (this.data) input.setAttribute('value', this.data);
			if (this.target.getAttribute('data-multiple') === '') input.setAttribute('multiple', '');
			else input.setAttribute('value', '');
			input.setAttribute('type', this.target.getAttribute('data-type'));
			input.setAttribute('name', this.target.getAttribute('data-name'));
			if (this.value) input.setAttribute('value', this.value);

			input.setAttribute('spellcheck', false);
			if (this.target.getAttribute('data-type' === 'file')) input.setAttribute('required', '');
			if (!this.openedDefault) {
				input.setAttribute('disabled', '');
				input.style.display = "none";
			}
			label.append(input);
			labelItem.append(label);

			if (this.openedDefault) {
				input.addEventListener('focus', (e) => {
					this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_opened'));
				});
			}
			// ####
			let dragAndDropArea = document.createElement('div');


			// let uploadStatus = document.createElement('div');
			// dragAndDropArea.append(uploadStatus);
			// uploadStatus.innerHTML += ;

			let uploadStatus = new ComponentElement('div', '<span> Uploading image </span>', {
				classList: ['settingUploadStatus'],
				style: {
					'display': 'none'
				}
			}).defineState('visible', {
				style: {
					'display': 'block'
				}
			}).appendTo(dragAndDropArea);
			// uploadStatus.replaceWith(document.createElement('h1'));

			// let uploadCurrentNumber = document.createElement('span');
			// uploadStatus.append(uploadCurrentNumber);

			let uploadCurrentNumber = new ComponentElement('span', null, {
				classList: ['settingUploadCurrentNumber']
			}).appendTo(uploadStatus);


			let workaround = new ComponentElement('span', ' of ', {
				classList: ['settingWorkaround']
			}).appendTo(uploadStatus);

			//***
			//BUG???: Cannot append to innerHTML here. If we do, we cannot modify the previous DOM element via the variable. Strange...
			// uploadStatus.innerHTML += " of ";
			//***
			// let workaround = document.createElement('span');
			// workaround.innerHTML = " of ";
			// uploadStatus.append(workaround)
			let uploadTotalNumber = new ComponentElement('span', null, {
				classList: ['settingUploadTotalNumber']
			}).appendTo(uploadStatus);

			// let uploadTotalNumber = document.createElement('span');
			// uploadStatus.append(uploadTotalNumber);

			if (this.inputType === 'file') {

				dragAndDropArea.classList.add('UI-Form-DragAndDrop-Area');
				labelItem.append(dragAndDropArea);

				input.addEventListener('change', (e) => {
					this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_opened'));
					this._showImages(e.target.files, dragAndDropArea);
				});

				dragAndDropArea.addEventListener('dragenter', (e) => {/* e.target.style.backgroundColor = '#ccc';	*/ });
				dragAndDropArea.addEventListener('dragleave', (e) => { e.target.style.backgroundColor = 'white'; });
				dragAndDropArea.addEventListener('dragover', (e) => { e.preventDefault(); });
				dragAndDropArea.addEventListener('drop', (e => {
					e.preventDefault();
					e.stopPropagation();
					this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_opened'));
					this._showImages(e.dataTransfer.files, dragAndDropArea);
				}));
			}
			let progressBar = document.createElement('span');
			progressBar.classList.add('.UI-Form-ProgressBar');
			labelItem.append(progressBar);

			// -----------------------------------------------------------
			let prevSetting = document.createElement('span');
			prevSetting.classList.add('previous_setting');

			if (!this.openedDefault) label.append(prevSetting);
			if (this.data) {
				if (this.inputType == 'text') prevSetting.innerText = this.data;
				else if (this.inputType == 'color') prevSetting.style.backgroundColor = this.data;
			} else prevSetting.classList.add('previous_setting_not_set');
			if (this.inputType == 'text') {/* prevSetting.innerText = this.data;*/ }
			else if (this.inputType == 'color') prevSetting.classList.add('previous_setting_color');


			// -----------------------------------------------------------
			let settingActions = document.createElement('span');
			settingActions.classList.add('setting_actions');
			if (this.data) settingActions.innerText = "Edit";
			else settingActions.innerText = "Add";
			if (!this.openedDefault) label.append(settingActions);
			settingActions.addEventListener('click', (e) => {
				if (this.beingEdited) {
					input.setAttribute('disabled', '');
					prevSetting.style.display = "initial";
					input.style.display = "none";
					settingActions.innerText = "Edit";
					this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_closed'));
				} else {
					input.removeAttribute('disabled');
					prevSetting.style.display = "none";
					input.style.display = "initial";
					settingActions.innerText = "Cancel";
					this.target.closest('x-UIComponent-Form').dispatchEvent(new Event('_setting_opened'));
				}
				this.beingEdited = !this.beingEdited;
			});
			// -----------------------------------------------------------
			let labelItemDescription = document.createElement('span');
			if (this.settingDescription) {
				labelItemDescription.classList.add('label_item_description');
				labelItemDescription.innerHTML = "<span>" + this.settingDescription + "</span>";
				labelItem.append(labelItemDescription);
			}
			// -----------------------------------------------------------
			this.target.append(labelItem);
			return { label, labelItem, input, prevSetting, settingActions, dragAndDropArea: (dragAndDropArea ? dragAndDropArea : undefined), uploadStatus, uploadCurrentNumber, uploadTotalNumber };
		}
	}

	_previewImages(filesArray, dragAndDropArea, filesCount, callback) {

		let parentForm = this.target.closest('x-UIComponent-Form');
		let parentFormInstance = COMPONENTS_INSTANCES.get(parentForm);

		let inputFormIndex = Array.from(parentForm.querySelectorAll('input[name="' + this.name + '"]')).indexOf(this.elements.input);
		if (filesArray.length > 0) {
			// console.log(this.elements.uploadCurrentNumber)
			let formData = new FormData();
			//TODO: get formId from the instance instead of the DOM element
			formData.append('form-id', parentFormInstance.getFormId());
			formData.append('uploadSessionToken', parentFormInstance.getUploadSessionToken());
			formData.append('file', filesArray[0]);
			formData.append('inputName', this.name);
			formData.append('uploadEntityId', inputFormIndex);
			let reader = new FileReader();
			reader.readAsDataURL(filesArray[0]);
			reader.addEventListener('load', event => {
				let imagePreview = new ImagePreview(dragAndDropArea, null, {
					'originalFilename': filesArray[0].name,
					'inputFormIndex': inputFormIndex,
					'currentImagesShown': this.imagesShownCount,
					'inputName': this.name
				})
				// let imagePreview = new ImagePreview(dragAndDropArea, filesArray[0].name, parentForm, inputFormIndex, this.imagesShownCount, this.name);
				this.elements.uploadCurrentNumber.textContent = this.currentFileBatchCount - filesArray.length + 1;
				imagePreview.onSelect = (selectTarget) => {
					this.dummyInputForPrimaryImage.value = selectTarget.dataset.filename;
				};
				imagePreview.onImageDelete = (next) => {
					this.imagesShownCount--;
					if (this.imagesShownCount === 0) this.dummyInputForPrimaryImage.value = '';
					//FIXME: Don't know if this is needed!
					formData.set('uploadSessionToken', parentFormInstance.getUploadSessionToken());

					next(this.imagesShownCount);
				};
				parentFormInstance.setCurrentlyUploading(true);
				misc.xhr(formData, 'POST', '/api/dashboard/products/upload', (res_upload, status_upload) => {
					if (status_upload == 200) {
						imagePreview.setFilename(res_upload.PAYLOAD.filename);
						console.log('imagesShownCount:  ', this.imagesShownCount);
						if (this.imagesShownCount === 0) this.dummyInputForPrimaryImage.value = imagePreview.getFilename();
						// this.dummyInputForPrimaryImage.value = res_upload.PAYLOAD.filename;
						// imageProgressBar.style.display = "none";
						if (!parentFormInstance.getUploadedAtLeastOnce()) parentFormInstance.setUploadSessionToken(res_upload.PAYLOAD.token);
						parentFormInstance.setUploadedAtLeastOnce();
						this.imagesShownCount++;
					}
					filesCount--;
					// if (filesCount == 0) parentFormInstance.setCurrentlyUploading(false);
					filesArray.shift();
					//Next image
					this._previewImages(filesArray, dragAndDropArea, filesCount, callback);
				}, (e_progress) => {
					let percent = e_progress.loaded / e_progress.total * 100;
					// imageProgressBar.value = percent;
					// if (percent === 100) progressBarWrapper.remove();
					imagePreview.setProgress(percent);
				});
			});
		} else {
			this.currentFileBatchCount = 0;
			parentFormInstance.setCurrentlyUploading(false);
			callback();
		}
	}


	updateSetting(newValue) {
		if (this.openedSettings > 0) this.openedSettings--;
		this.beingEdited = false;
		if (newValue) this.elements.prevSetting.classList.remove('previous_setting_not_set')
		if (this.target.getAttribute('data-type') == 'text') {
			this.elements.prevSetting.innerText = newValue;
		} else if (this.target.getAttribute('data-type') == 'color') {
			this.elements.prevSetting.style.backgroundColor = newValue;
		}
		if (this.elements) {
			this.elements.prevSetting.style.display = "initial";
			this.elements.input.style.display = "none";
			this.elements.input.setAttribute('value', newValue);
			this.elements.settingActions.innerText = "Edit";
			this.elements.input.setAttribute('disabled', '');
		}

	}

	getInputType() { return this.inputType; }
	getFiles() { return this.files; }
	getName() { return this.name; }
	getValue() { return this.elements.input.value; }
	onProgress() { return this.onprogress; }
	getPrimaryFile() { return this.target.querySelector() }

	revertSetting() {
		if (this.localInstances.length > 0) {
			for (let control of this.localInstances) control.revertSetting();
		} else {
			// this.dragAndDropFiles = [];
			if (!this.openedDefault) {
				this.elements.prevSetting.style.display = "initial";
				this.elements.input.style.display = "none";
				this.elements.input.setAttribute('disabled', '');
				this.elements.settingActions.innerText = "Edit";
				this.beingEdited = false;
			} else {
				if (this.elements.dragAndDropArea) this.elements.dragAndDropArea.innerHTML = null;
				this.elements.input.value = null;
			}
		}
	}

	setFormIndex(index) { this.formIndex = index; }
}

module.exports = UIComponentFormSetting;

//-----------------------------------------------------------------------------------------------------


