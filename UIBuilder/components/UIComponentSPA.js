
const COMPONENTS_INSTANCES = require('../index').COMPONENTS_INSTANCES;
const misc = require('../../../../common/scripts/misc');


class UIComponentSPA {

	constructor(target) {

		let currentURL = window.location.href;
		this.target = target;
		this.currentPageID = currentURL.split('/dashboard/')[1];
		if (this.currentPageID === '') this.currentPageID = 'shop-settings' // default for .../dashboard/
		this.pages = {};
		let pageElements = this.target.querySelectorAll('x-uicomponent-page');
		for (let pageElement of pageElements) {
			this.pages[pageElement.getAttribute('data-page-id')] = pageElement;
		}

	}

	switchToPage(pageId) {
		this._crossfadeCallback(this.pages[this.currentPageID], this.pages[pageId], 100, (cont) => {
			misc.xhr({ "p": pageId }, 'GET', '/api/dashboard/getPage/', (res) => {
				//TODO: Use updateComponentInputValues() instead. It doesn't work for some reason FIX!
				for (let domElement of COMPONENTS_INSTANCES.keys()) {
					// console.log(domElement)
					if (res) {
						if (res.PAYLOAD[domElement.getAttribute('data-content-id')]) {
							COMPONENTS_INSTANCES.get(domElement).updateSetting(res.PAYLOAD[domElement.getAttribute('data-content-id')]);
						}

					}
				}
				///////
				this.currentPageID = pageId;
				window.history.pushState(this.currentPageID, this.currentPageID, '/dashboard/' + this.currentPageID);
				cont();
			});
			// getOtherContent(pageId);
		});
	}

	_crossfadeCallback(elementA, elementB, duration, inbetweenCallback) {
		if (!elementA) {
			if (elementB) {
				elementB.style.display = "block";
				setTimeout(() => {
					elementB.style.opacity = "100%";
				}, duration);
			}
		} else {
			if (elementA && elementB) {
				elementA.style.opacity = "0%";
				setTimeout(() => {
					elementA.style.display = "none";
					if (inbetweenCallback) inbetweenCallback(() => {
						elementB.style.display = "block";
						setTimeout(() => {
							elementB.style.opacity = "100%";
						}, duration);
					});
				}, duration);
			}
		}
	}

}

module.exports = UIComponentSPA;

let apiContentMaps = {
	'shop-products': [
		'/api/dashboard/products/getProducts'
	]
}

// DO NOT USE!!
//Also, it needs to be made recursive sequential beore using.
//Perform xhr requests per component configuration instead
function getOtherContent(pageID) {
	for (let path of apiContentMaps[pageID]) {
		misc.xhr(null, 'GET', path, (res) => {
			let elementsToUpdate = document.querySelectorAll('[data-content-id]');
			for (let element of elementsToUpdate) {
				for (let domElement of COMPONENTS_INSTANCES.keys()) {
					// console.log(domElement)
					if (res) {
						if (res.PAYLOAD[domElement.getAttribute('data-content-id')]) {

							COMPONENTS_INSTANCES.get(element).updateSetting(res.PAYLOAD[element.getAttribute('data-content-id')]);
						}
					}
				}
			}
		});

	}


}

function getObjectMapValue(o) { return o[Object.keys(o)[0]] }