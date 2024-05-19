const ComponentElement = require('../../../components/ComponentElement');
const misc = require('../../../../../../common/scripts/misc');
const UIComponent = require('../../../UIComponent');
const CssLoader = require('../../../index').CssLoader;
const COMPONENTS_INSTANCES = require('../../../index').COMPONENTS_INSTANCES;

//NOTE!!: This statement must always be outside of the constructor so that the <style> element is only appended ONCE to the HTML head.
let style = new CssLoader(require('./style.css.js'));

// module.exports = class ImagePreview {


//     constructor(target, originalFilename, parentForm, inputFormIndex, currentImagesShown, inputName) {
//         this.target = target;
//         this.parentForm = parentForm;
//         this.parentFormInstance = COMPONENTS_INSTANCES.get(parentForm);
//         this.originalFilename = originalFilename;
//         this.inputFormIndex = inputFormIndex;
//         this.filename;
//         this.currentImagesShown = currentImagesShown;
//         this.inputName = inputName;

//         this.onImageDelete;
//         this.onSelect;

//         // this.dummyInputForPrimaryImage = document.createElement('input');
//         // this.dummyInputForPrimaryImage.type = 'hidden';
//         // this.dummyInputForPrimaryImage.name = this.childInputsPreffix + 'primaryImage';
//         // this.target.append(this.dummyInputForPrimaryImage);

//         this.elements = this._build();

//     }
//     getFilename() { return this.filename; }
//     get() { return this.elements.imageContainer; }

//     select(selectTarget) {
//         // this.isSelected = true;

//         // this.dummyInputForPrimaryImage.value = this.filename;

//         if (typeof selectTarget === 'undefined' || selectTarget == null) selectTarget = this.elements.imageContainerBottom;
//         if (typeof this.onSelect !== 'undefined') this.onSelect(selectTarget);

//         let prevSelected = this.target.querySelector('.' + style.IMAGE_CONTAINER_BOTTOM_SELECTED);
//         if (prevSelected !== null) {
//             prevSelected.classList.remove(style.IMAGE_CONTAINER_BOTTOM_SELECTED);
//             // selectTarget.setAttribute('data-primary-file');
//             prevSelected.dataset.isSelected = 0;
//         }
//         selectTarget.classList.add(style.IMAGE_CONTAINER_BOTTOM_SELECTED);
//         // selectTarget.setAttribute('data-primary-file');
//         selectTarget.dataset.isSelected = 1;



//     }

//     setProgress(percent) {
//         this.elements.imageProgressBar.value = percent;
//         if (percent == 100) {
//             this.elements.progressBarWrapper.remove();
//         }
//     }

//     setFilename(filename) {
//         this.filename = filename;
//         this.elements.imageContainerBottom.get().dataset.filename = filename;
//     }

//     _build() {
//         let imageContainer = document.createElement('div');
//         imageContainer.classList.add(style.PREVIEW_IMAGE_CONTAINER);
//         this.target.appendChild(imageContainer);
//         // this.onImageCreate();


//         let imageContainerTop = document.createElement('div');
//         imageContainerTop.classList.add(style.PREVIEW_IMAGE_CONTAINER_TOP);
//         imageContainer.append(imageContainerTop);

//         let imageContainerBottom = new ComponentElement('div', null, {
//             classList: [style.IMAGE_CONTAINER_BOTTOM]
//         }, {
//             'click': () => { this.select(imageContainerBottom.get()) }
//         }).appendTo(imageContainer);
//         if (this.currentImagesShown === 0) this.select(imageContainerBottom.get());
//         else imageContainerBottom.get().dataset.isSelected = 0;

//         let originalFilename = document.createElement('span');
//         originalFilename.innerHTML = "<span title=\"" + this.originalFilename + "\">" + this.originalFilename + "</span>";
//         originalFilename.classList.add(style.IMAGE_ORIGINAL_FILENAME);
//         imageContainerTop.append(originalFilename);

//         let deleteImageButton = document.createElement('span');
//         deleteImageButton.innerHTML = "🞭";
//         deleteImageButton.classList.add(style.DELETE_IMAGE_BUTTON);
//         imageContainerTop.append(deleteImageButton);
//         deleteImageButton.addEventListener('click', (e) => {
//             e.stopPropagation();
//             this.onImageDelete((imagesShownCount) => {
//                 //TODO: Maybe move the selection/deselection logic outside this class and use a this.isSelected variable
//                 if (this.elements.imageContainerBottom.get().dataset.isSelected === '1') {
//                     let availableToSelect = this.target.querySelectorAll('.' + style.IMAGE_CONTAINER_BOTTOM + '[data-is-selected="0"]')[0];
//                     if (availableToSelect) this.select(availableToSelect);
//                 }

//                 misc.xhr({
//                     'uploadSessionToken': this.parentFormInstance.getUploadSessionToken(),
//                     'form-id': this.parentFormInstance.getFormId(),
//                     'uploadEntityId': this.inputFormIndex,
//                     'inputName': this.inputName
//                 }, 'POST', '/api/dashboard/cancelUpload?filename=' + this.filename, (resCancel, statusCancel) => {
//                     imageContainer.remove();

//                     if (resCancel.HEADERS.STATUS_CODE === "NEED_CREATE_NEW_SESSION") {
//                         this.parentFormInstance.setUploadSessionToken('CREATE_NEW');
//                         this.parentFormInstance.setUploadedAtLeastOnce(false);
//                     }
//                 });
//             });
//         });

//         let image = document.createElement('img');
//         image.setAttribute('src', event.target.result);
//         image.setAttribute('draggable', 'false');
//         image.className = style.PREVIEW_IMAGE;
//         imageContainerBottom.append(image);

//         let progressBarWrapper = document.createElement('div');
//         progressBarWrapper.className = style.PROGRESS_BAR_WRAPPER;
//         imageContainer.appendChild(progressBarWrapper);

//         let imageProgressBar = document.createElement('progress');
//         imageProgressBar.max = 100;
//         progressBarWrapper.append(imageProgressBar);

//         return { imageContainer, imageProgressBar, progressBarWrapper, imageContainerBottom };
//     }


// }


// =====================================================================================================================================================================
// =====================================================================================================================================================================


module.exports = class ImagePreview extends UIComponent {


    // constructor(target, originalFilename, parentForm, inputFormIndex, currentImagesShown, inputName) {
    constructor(target, data, options) {
        super("ImagePreview", target, data, options);

        // this.target = target;
        // this.parentForm = parentForm;
        this.parentFormInstance = COMPONENTS_INSTANCES.get(target.closest('x-UIComponent-Form'));
        // this.originalFilename = originalFilename;
        // this.inputFormIndex = inputFormIndex;
        this._filename;
        // this.currentImagesShown = currentImagesShown;
        // this.inputName = inputName;

        this.onImageDelete;
        this.onSelect;

        // this.dummyInputForPrimaryImage = document.createElement('input');
        // this.dummyInputForPrimaryImage.type = 'hidden';
        // this.dummyInputForPrimaryImage.name = this.childInputsPreffix + 'primaryImage';
        // this.target.append(this.dummyInputForPrimaryImage);

        this.elements = this._build();

        // super.targetAppend(this.elements.imageContainer);

    }
    getFilename() { return this._filename; }
    get() { return this.elements.imageContainer; }

    select(selectTarget) {
        // this.isSelected = true;

        // this.dummyInputForPrimaryImage.value = this.filename;

        if (typeof selectTarget === 'undefined' || selectTarget == null) selectTarget = this.elements.imageContainerBottom;
        if (typeof this.onSelect !== 'undefined') this.onSelect(selectTarget);

        let prevSelected = this._target.querySelector('.' + style.IMAGE_CONTAINER_BOTTOM_SELECTED);
        if (prevSelected !== null) {
            prevSelected.classList.remove(style.IMAGE_CONTAINER_BOTTOM_SELECTED);
            // selectTarget.setAttribute('data-primary-file');
            prevSelected.dataset.isSelected = 0;
        }
        selectTarget.classList.add(style.IMAGE_CONTAINER_BOTTOM_SELECTED);
        // selectTarget.setAttribute('data-primary-file');
        selectTarget.dataset.isSelected = 1;



    }



    setProgress(percent) {
        this.elements.imageProgressBar.value = percent;
        if (percent == 100) {
            this.elements.progressBarWrapper.remove();
        }
    }

    setFilename(filename) {
        this._filename = filename;
        this.elements.imageContainerBottom.get().dataset.filename = filename;
    }

    _build() {
        let imageContainer = document.createElement('div');
        imageContainer.classList.add(style.PREVIEW_IMAGE_CONTAINER);
        super.targetAppend(imageContainer);
        // this.target.appendChild(imageContainer);
        // this.onImageCreate();


        let imageContainerTop = document.createElement('div');
        imageContainerTop.classList.add(style.PREVIEW_IMAGE_CONTAINER_TOP);
        imageContainer.append(imageContainerTop);

        let imageContainerBottom = new ComponentElement('div', null, {
            classList: [style.IMAGE_CONTAINER_BOTTOM]
        }, {
            'click': () => { this.select(imageContainerBottom.get()) }
        }).appendTo(imageContainer);
        console.log(')))))))>>>>', this._options.currentImagesShown)
        if (this._options.currentImagesShown === 0) this.select(imageContainerBottom.get());
        else imageContainerBottom.get().dataset.isSelected = 0;

        let originalFilename = document.createElement('span');
        originalFilename.innerHTML = "<span title=\"" + this._options.originalFilename + "\">" + this._options.originalFilename + "</span>";
        originalFilename.classList.add(style.IMAGE_ORIGINAL_FILENAME);
        imageContainerTop.append(originalFilename);

        let deleteImageButton = document.createElement('span');
        deleteImageButton.innerHTML = "🞭";
        deleteImageButton.classList.add(style.DELETE_IMAGE_BUTTON);
        imageContainerTop.append(deleteImageButton);
        deleteImageButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onImageDelete((imagesShownCount) => {
                //TODO: Maybe move the selection/deselection logic outside this class and use a this.isSelected variable
                if (this.elements.imageContainerBottom.get().dataset.isSelected === '1') {
                    let availableToSelect = this._target.querySelectorAll('.' + style.IMAGE_CONTAINER_BOTTOM + '[data-is-selected="0"]')[0];
                    if (availableToSelect) this.select(availableToSelect);
                }

                misc.xhr({
                    'uploadSessionToken': this.parentFormInstance.getUploadSessionToken(),
                    'form-id': this.parentFormInstance.getFormId(),
                    'uploadEntityId': this._options.inputFormIndex,
                    'inputName': this._options.inputName
                }, 'POST', '/api/dashboard/cancelUpload?filename=' + this._filename, (resCancel, statusCancel) => {
                    imageContainer.remove();
                    super.remove();
                    if (resCancel.HEADERS.STATUS_CODE === "NEED_CREATE_NEW_SESSION") {
                        this.parentFormInstance.setUploadSessionToken('CREATE_NEW');
                        this.parentFormInstance.setUploadedAtLeastOnce(false);
                    }
                });
            });
        });

        let image = document.createElement('img');
        image.setAttribute('src', event.target.result);
        image.setAttribute('draggable', 'false');
        image.className = style.PREVIEW_IMAGE;
        imageContainerBottom.append(image);

        let progressBarWrapper = document.createElement('div');
        progressBarWrapper.className = style.PROGRESS_BAR_WRAPPER;
        imageContainer.appendChild(progressBarWrapper);

        let imageProgressBar = document.createElement('progress');
        imageProgressBar.max = 100;
        progressBarWrapper.append(imageProgressBar);

        return { imageContainer, imageProgressBar, progressBarWrapper, imageContainerBottom };
    }


}