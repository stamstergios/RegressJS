class NamesChainStringBuilder {
	constructor(categoriesTree) {
		this.categoriesTree = categoriesTree;
		this.memoized = {};
	}

	build(idChainArray, key) {
		let chain = [];
		let i = 0;
		function findRecursively(node) {
			let currentCategory = node.find(x => x.id === idChainArray[i]);
			if (currentCategory) { //FIXME: temporary guard for deleted categories.
				let name = getValueDotNotation(currentCategory, key);
				// console.log('--->',name)
				// let name = currentCategory.properties[key];
				chain.push(name);
				i++;
				if (i < idChainArray.length) findRecursively(currentCategory.subcategories);
			}
		}

		if (typeof this.memoized[idChainArray] !== 'undefined') return this.memoized[idChainArray];
		else {
			findRecursively(this.categoriesTree);
			this.memoized[idChainArray] = chain;
			return chain;
		}
	}
}

function getValueDotNotation(o, s) {
	if (!s.includes('.')) return o[s];
	else return s.split('.').reduce((accumulator, currentValue) => accumulator[currentValue], o);
}

module.exports = {
	NamesChainStringBuilder,
};