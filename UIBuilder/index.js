const misc = require('../../../common/scripts/misc');


class UIBuilder {

	constructor(initComponentsTarget, pageContent) {
		this.constructor.initComponents(COMPONENTS_TREE, document.querySelector('body'), pageContent);
		this.constructor.updateComponentInputValues(pageContent);
		return this;
	}

	//TODO!: Make a distinction between instantiating a single element that is passed as an arguement and instantiating all children of an element!!!

	static initComponents(componentsTree, selectorTarget, pageContent) {
		let tree = componentsTree || COMPONENTS_TREE
		let initTarget = selectorTarget;
		let instances = [];
		doInit(tree);

		function doInit(node) {
			for (let tag in node) {

				function instantiateTarget(target) {
					let contentId = target.getAttribute('data-content-id');
					let instance;
					if (contentId) instance = new node[tag].classMapping(target, tag, pageContent ? pageContent[contentId] : null);
					else instance = new node[tag].classMapping(target, tag);
					instances.push(instance);
					COMPONENTS_INSTANCES.set(target, instance);
				}

				if (node[tag].children) doInit(node[tag].children);

				let targets = initTarget.querySelectorAll(tag);
				if (initTarget.tagName.toLowerCase() === tag.toLowerCase()) {
					//TODO: optimize this!
					targets = Array.from(targets);
					targets.unshift(selectorTarget);
				}
				for (let target of targets) { instantiateTarget(target); }
			}
		}

		//TODO: Decide on this:

		//Return all instances if instatiating recursively.
		// return instances.length === 1 ? instances[0] : instances; 

		//Currently we return only the selectorTarget's instance. It's easier to deal with forms this way since they require recursive instantiation of their child elements.
		return COMPONENTS_INSTANCES.get(selectorTarget);
	}

	static updateComponentInputValues(pageContent) {
		for (let domElement of COMPONENTS_INSTANCES.keys()) {
			if (PAGE_CONTENT[domElement.getAttribute('data-content-id')]) {
				COMPONENTS_INSTANCES.get(domElement).updateSetting(pageContent[domElement.getAttribute('data-content-id')]);
			}
		}
	}

}
var COMPONENTS_INSTANCES = new Map();

class UICache {
	constructor() {
		this.CACHE = [];
	}

	try(requestURL, callback, forceRequest) {
		if (this.CACHE[requestURL]) callback(this.CACHE[requestURL]);
		else {
			misc.xhr(null, 'GET', requestURL, (res, status) => {
				callback(res, status);
				this.CACHE[requestURL] = res;
			});
		}
	}

	update(requestURL, data) {
		this.CACHE[requestURL] = data;
	}
}

let uiCache = new UICache();

//The stack builds up at the end.
let escapeStack = [];
window.addEventListener('load', () => {
	addEventListener('keydown', e => {
		if (e.key === 'Escape' && escapeStack.length > 0) {
			escapeStack[escapeStack.length - 1].escHandler();
			escapeStack.pop();
		}
	});
});

class UiRandom {
	constructor(randomStringsArray) {
		this.randomStrings = randomStringsArray;
		this.currentIndex = 0;
		this.randomStringsCount = randomStringsArray.length;
		this.rolloverCount = 0;
	}

	getRandomString() {
		let s = this.getRollOverPrefix(this.rolloverCount) + this.randomStrings[this.currentIndex];
		this.increment();
		return s;
	}

	increment() {
		this.currentIndex++;
		if (this.currentIndex === this.randomStringsCount) {
			this.currentIndex = 0;
			this.rolloverCount++;
		}
	}

	//When we run out of random strings, we roll over and start prepending a,b...aa,ab,... at the start.
	//https://stackoverflow.com/a/8241071
	getRollOverPrefix(n) {
		var ordA = 'a'.charCodeAt(0);
		var ordZ = 'z'.charCodeAt(0);
		var len = ordZ - ordA + 1;
		var s = "";
		while (n >= 0) {
			s = String.fromCharCode(n % len + ordA) + s;
			n = Math.floor(n / len) - 1;
		}
		return s;
	}
}

let uiRandom = new UiRandom(require('../../../common/scripts/randomStrings'));

class CssLoader {
	constructor(template) {
		
		let prefix = uiRandom.getRandomString();
		let p = new Proxy(this, {
			get: (target, prop) => {
				let classNameGenerated = prefix + "__" + prop.toLowerCase();
				target[prop.toUpperCase()] = classNameGenerated;
				return classNameGenerated;
			}
		});
		//NOTE: This regex is "needed" because webpack cannot minify code inside template literals...
		//Maybe add a template literal minifier plugin in webpack...?
		this.styleSheet = template(p).replace(/\t|\n/gi, '');
		let styleElement = document.createElement('style');
		document.querySelector('head').append(styleElement);
		styleElement.textContent = this.styleSheet;
	}
}


module.exports = { UIBuilder, COMPONENTS_INSTANCES, uiCache, escapeStack, CssLoader };

//TODO: turn tags into variables e.g. UIBuilder.UI_COMPONENT_TABLE












var COMPONENTS_TREE = {

	'x-UIComponent-SPA': {
		'classMapping': require('./components/UIComponentSPA'),
		'children': {
			'x-UIComponent-Page': {
				'classMapping': require('./components/UIComponentPage'),
				'children': {
					'x-UIComponent-Form': {
						"classMapping": require('./components/UIComponentForm'),
						"children": {
							'x-UIComponent-Form-Setting': {
								'classMapping': require('./components/UIComponentFormSetting')
							}
						}
					},
					'x-UIComponent-Table': {
						'classMapping': require('./components/UIComponentTable')
					},
					'x-UIComponent-Modal': {
						'classMapping': require('./components/UIComponentModal')
					},
					'x-UIComponent-CategoriesTree': {
						'classMapping': require('./components/UIComponentCategoriesTree')
					}
				}
			}
		}

	}
}

// var COMPONENTS_TREE = {
// 	'x-UIComponent-Form': {
// 		"classMapping": require('./components/UIComponentForm'),
// 	},
// 	'x-UIComponent-Form-Description': {
// 		'classMapping': require('./components/UIComponentFormDescription')
// 	},
// 	'x-UIComponent-Form-Setting': {
// 		'classMapping': require('./components/UIComponentFormSetting')
// 	},
// 	'x-UIComponent-Form-Setting-Description': {
// 		'classMapping': require('./components/UIComponentFormSettingDescription')
// 	},
// 	'x-UICOmponent-Form-Title': {
// 		'classMapping': require('./components/UIComponentFormTitle')
// 	},
// 	'x-UIComponent-Table': {
// 		'classMapping': require('./components/UIComponentTable')
// 	},
// 	'x-UIComponent-Modal': {
// 		'classMapping': require('./components/UIComponentModal')
// 	},
// 	'x-UIComponent-CategoriesTree': {
// 		'classMapping': require('./components/UIComponentCategoriesTree')
// 	},
// 	'x-UIComponent-Page': {
// 		'classMapping': require('./components/UIComponentPage')
// 	},
// 	'x-UIComponent-SPA': {
// 		'classMapping': require('./components/UIComponentSPA')
// 	}
// }