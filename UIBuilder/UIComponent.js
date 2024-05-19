const { COMPONENTS_INSTANCES } = require(".");
const ComponentElement = require("./components/ComponentElement");

const ATTRIBUTE_PREFIX = "data";
const TAG_PREFIX = "x-UIComponent";

module.exports = class UIComponent {

    static queryComponentsAll(node, query) {
        let a = node.querySelectorAll(query);
        let r = [];
        for (let i = 0; i < a.length; i++) {
            r.push(COMPONENTS_INSTANCES.get(n[i]));
        }
        return r;
    }

    static queryComponent(node, query) {
        return COMPONENTS_INSTANCES.get(node.querySelector(query));
    }

    constructor(componentName, target, data, options) {
        this._componentName = componentName;
        this._target = target;
        this._options = {};
        this._data = data;
        // if (COMPONENTS_LITERALS.hasOwnProperty(this._target.tagName)) {
        if (makeHtmlTagName(this._componentName).toUpperCase() === this._target.tagName) {
            let targetAttributes = Array.from(this._target.attributes);
            for (let a of targetAttributes) {
                if (a.name.indexOf(ATTRIBUTE_PREFIX + '-') === 0) {
                    if (a.value === 'true') this._options[toCamelCase(a.name)] = true;
                    else if (a.value === 'false') this._options[toCamelCase(a.name)] = false;
                    else if (a.value.match(/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/)) this._options[toCamelCase(a.name)] = parseFloat(a.value);
                    else this._options[toCamelCase(a.name)] = a.value;
                }
            }

        } else {
            console.log('333333')
            this._options = options;

        }
        this._newTarget = new ComponentElement(makeHtmlTagName(this._componentName), null, { style: { 'display': 'inline-block' } }).appendTo(this._target);
    }

    // targetAppend(innerRoot) {
    //     if (ComponentElement.isProxy(this._target)) this._target.append(innerRoot);
    //     else {
    //         if (ComponentElement.isProxy(innerRoot)) this._target.append(innerRoot.element);
    //         else this._target.append(innerRoot);
    //     }
    // }

    remove() {
        this._newTarget.remove()
    }

    targetAppend(innerRoot) {

        this._newTarget.append(innerRoot)


    }
}


function makeHtmlTagName(componentName) {
    return TAG_PREFIX + '-' + toDashes(componentName);
}

function toDashes(s) {
    return s.replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match);
}

function toCamelCase(s) {
    return s.replace(/-([a-z])/g, (hyphenPart) => { return hyphenPart[1].toUpperCase(); });
}

// const COMPONENTS_LITERALS = [
//     'x-UIComponent-Form',
//     'x-UIComponent-Form-Description',
//     'x-UIComponent-Form-Setting',
//     'x-UIComponent-Form-Setting-Description',
//     'x-UICOmponent-Form-Title',
//     'x-UIComponent-Table',
//     'x-UIComponent-Modal',
//     'x-UIComponent-CategoriesTree',
//     'x-UIComponent-Page',
//     'x-UIComponent-SPA'
// ];

const COMPONENTS_LITERALS = [
    'X-UICOMPONENT-FORM',
    'X-UICOMPONENT-FORM-DESCRIPTION',
    'X-UICOMPONENT-FORM-SETTING',
    'X-UICOMPONENT-FORM-SETTING-DESCRIPTION',
    'X-UICOMPONENT-FORM-TITLE',
    'X-UICOMPONENT-TABLE',
    'X-UICOMPONENT-MODAL',
    'X-UICOMPONENT-CATEGORIESTREE',
    'X-UICOMPONENT-PAGE',
    'X-UICOMPONENT-SPA'
]