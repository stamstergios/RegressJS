let TREE = [

	{
		"level": 0,
		"name": "Top category 1",
		"id": "567655767i63",
		"children": [

			{
				"level": 1,
				"name": "Middle category 1",
				"id": "9835767365756",
				"children": [

				]
			},
			{
				"level": 1,
				"name": "Middle category 2",
				"id": "5241456245243",
				"children": [
					{
						"level": 2,
						"name": "Bottom category 1asdkjlasd",
						"id": "56787354534524324",
					},
					{
						"level": 2,
						"name": "Bottom category 2asdas",
						"id": "123443565732532",
					}

				]
			},
			{
				"level": 1,
				"name": "Middle category 3",
				"id": "5235475463534543",
				"children": [
					{
						"level": 2,
						"name": "Bottom category 2asdas",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					}
				]
			},
		]
	},
	{
		"level": 0,
		"name": "Top category 2",
		"id": "567655767i63",
		"children": [
			{
				"level": 1,
				"name": "Middle category 4",
				"id": "5235475463534543",
				"children": []
			},
			{
				"level": 1,
				"name": "Middle category 1",
				"id": "9835767365756",
				"children": [
					{
						"level": 2,
						"name": "Bottom category 2asdas",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					},
					{
						"level": 2,
						"name": "Bottom category qwer",
						"id": "123443565732532",
					}
				]
			}
		]
	}
]


class UIComponentCategoriesTree {

	constructor(buildTarget, treeData) {

		this.tree = TREE || null;
		this.buildTarget = buildTarget;
		this.currentTop = 0;
		this.displacements = [];
		this.names = {
			LEVEL: "level",
			STEM: "categoryStem",
			COLUMN: "categoryColumn",
			BUTTON: "categoryElement",
			BUTTON_HAND: "categoryElement_hand",
			BUTTON_CONTAINER: "categoryElement_innerContainer",
			BUTTON_TITLE: "categoryElement_title",
			BUTTON_CLICKED: "cetegory_element_clicked",
			BUTTON_BUSY: "categoryElement_busy",
			BUTTON_RIGHTHAND: "categoryElement_handRight",
			BUTTON_INPUT: "categoryElement_input",
			CONTEXT_MENU: "category_context_menu",
			CONTEXT_MENU_OPTION: "category_context_menu_option",
			CONTEXT_MENU_OPTION_DISABLED: "category_context_menu_option_disabled"

		}

		this.CSS_VARIABLES = {
			FONT_NORMAL: 14,
			FONT_LARGE: 15,
			BORDER_WIDTH: 3
		}


		this.STYLESHEET =`
		

		.${this.names.LEVEL} * {
			font-size: ${this.CSS_VARIABLES.FONT_NORMAL}px;
		}

		.${this.names.LEVEL} {
			display: inline-block;
			width: fit-content;
			position: relative;
			left: -5px;
			
		}
		
		.${this.names.STEM} {
			width: 3px;
			border-left: ${this.CSS_VARIABLES.BORDER_WIDTH}px solid #262262;
			display: inline-block;
			vertical-align: top;
			position: relative;
		}
		
		.${this.names.COLUMN} {
			display: inline-block;
			position: relative;
			left: -5px;
			vertical-align: top;
		
		}
		
		.${this.names.BUTTON_RIGHTHAND} {
			border-bottom:  ${this.CSS_VARIABLES.BORDER_WIDTH}px solid #262262;
			width: 20px;
			height: 3px;
			position: relative;
			top: -3.2px;
		}
		
		.${this.names.BUTTON} {
			margin-bottom: 20px;
			cursor: pointer;
		}
		
		.${this.names.BUTTON}:hover span {
			text-decoration: underline;
		}
		
		.${this.names.BUTTON} div {
			display: inline-block;
		}
		
		.${this.names.BUTTON_HAND} {
			border-bottom:  ${this.CSS_VARIABLES.BORDER_WIDTH}px solid #262262;
			width: 25px;
			height: 3px;
			vertical-align: top;

		}
		
		.${this.names.BUTTON_CONTAINER}{
			width: 150px;
			border:  ${this.CSS_VARIABLES.BORDER_WIDTH}px solid #262262;
			padding: 8px;
			background-color: white;
			height: 50px;
		}	
		
		.${this.names.BUTTON_TITLE} {
			font-weight: 600;
		}
		
		.categoryElement_subTitle {
			font-size: 90%;
		}
		
		.${this.names.BUTTON_CLICKED} .${this.names.BUTTON_CONTAINER} {
			background-color: #262262;
			color: white;
		}
		
		.${this.names.BUTTON_CLICKED} .${this.names.BUTTON_TITLE}{
			font-weight: bold;
			font-style: italic;
			font-size: 15px;
		}

		.${this.names.CONTEXT_MENU}{
			color: #262262;
			/* position: absolute; */
			/* width: 100px; */
			background-color: white;
			border: 3px solid #262262;
			padding: 5px;
			cursor: default;
			
		}

		.${this.names.CONTEXT_MENU} * {
			font-size: 14px;
		}

		.${this.names.CONTEXT_MENU} div{
			border: none;
		}
		
		.${this.names.CONTEXT_MENU_OPTION}{
			cursor: pointer;
			border: none;
			padding: 5px;
		}
		.${this.names.CONTEXT_MENU_OPTION}:hover{
			background-color: #262262;
			color: white;
		}
		
		.${this.names.BUTTON} form {
			width: 85%;
			display: inline-block;
		}

		.${this.names.BUTTON_INPUT}{
			border: 3px solid #262262;
			outline: none;
			width: 90%;
		}

		.${this.names.BUTTON_BUSY}:hover span{
			text-decoration: none;
		}
		
		.${this.names.CONTEXT_MENU_OPTION_DISABLED}{
			color: #ccc;
			cursor: default;
		}
		
		.${this.names.CONTEXT_MENU_OPTION_DISABLED}:hover{
			background-color: initial;
			color: #ccc
		}

		`;

		//NOTE: now it seems this is not needed? The glitch appears only when the initial page in to 'products'
		//Hack because in this webpage only, the firest appended newLevel has 0 offsetHeight for some reason.
		//As there is no async version of .append(), we use a setTimeout() hack only for the first time the tree is generated.
		//This is a flag so that we delay only the first time.
		this.__firstLevelGenerated__ = false;
		//This is the time in ms to manually delay the level generation
		this.__firstLevelDelayHack = 0;

		let styleEl = document.createElement('style');
		styleEl.textContent = this.STYLESHEET;
		document.querySelector('head').append(styleEl);

		console.log(document.querySelector('style'));


		this.mouseY = 0;
		this.mouseX = 0

		this.createLevel(buildTarget, []);
		this.rootLevel = buildTarget.querySelectorAll('.' + this.names.LEVEL)[0];
		this.buildTarget.style.position = "relative";

		this.buildTarget.addEventListener('mousemove', (e_mouse) => {
			let rect = this.buildTarget.getBoundingClientRect();
			this.mouseY = e_mouse.clientY - rect.top;
			this.mouseX = e_mouse.clientX - rect.left;

		});

		this.buildTarget.addEventListener('click', (e) => {
			if (this.contextMenuOpen) {
				this.buildTarget.querySelector('.' + this.names.CONTEXT_MENU).remove();
				this.contextMenuOpen = false;
			}
			// if (this.buttonWithInput) {
			// 	this.buttonWithInput.querySelector('.' + this.names.BUTTON_INPUT).remove();
			// 	this.buttonWithInput.querySelector('.' + this.names.BUTTON_TITLE).style.display = "block";
			// }
		});
		this.contextMenuOpen = false;
		this.buttonWithInput = null;


	}

	createLevel(parent, path, spawnPos, parentHeight) {
		if (this.tree != null) {
			let root = JSON.parse(JSON.stringify(this.tree)); //copy
			if (!(path == null || typeof path === 'undefined')) {
				for (let index of path) {
					root = root[index].children;
				}
			}
			//has children
			if (root !== undefined && root.length > 0) {
				let MARGIN_BOTTOM = 20;
				let newLevel = document.createElement('div');
				newLevel.classList.add(this.names.LEVEL);
				let stem = document.createElement('div');
				stem.classList.add(this.names.STEM);
				newLevel.append(stem);
				let column = document.createElement('div');
				column.classList.add(this.names.COLUMN);
				newLevel.append(column);
				parent.append(newLevel);
				setTimeout(() => {
					// if (parent.children.includes(newLevel)) {
					let lastButtonHeight;
					for (let i = 0; i < root.length; i++) {
						let buttonPath = path.slice() //copy
						buttonPath.push(i);
						let hasChildren = root[i].children == undefined || root[i].children.length === 0 ? false : true;
						lastButtonHeight = this.createButton(root[i].id, root[i].name, hasChildren, buttonPath, column);
					}
					stem.style.height = column.offsetHeight - lastButtonHeight + 1 + 'px';
					console.log(column.style.color, - lastButtonHeight + 1 + 'px');
					stem.style.top = lastButtonHeight / 2 - 9 + 'px';
					// vvvv ---------- disable these lines to try a different, maybe better layout --------- vvvv
					if (spawnPos !== undefined) {
						let Ydisplacement = - newLevel.offsetHeight / 2 + spawnPos + parentHeight / 2 + MARGIN_BOTTOM / 2 - 2.6;
						// this.lastOffset = Ydisplacement;
						newLevel.style.top = Ydisplacement + 'px';
						// if (newLevel.offsetTop < 0) { //-2 instead of 0 for tolerance
						if (newLevel.getBoundingClientRect().top < this.buildTarget.getBoundingClientRect().top) { //-2 instead of 0 for tolerance
							console.log('newLevel.offsetTop: ', newLevel.offsetTop);
							this.currentTop += Math.abs(Ydisplacement);
							this.rootLevel.style.top = this.currentTop + 'px';
							if (path.length > this.displacements.length) this.displacements.push(Math.abs(Ydisplacement));
						}
					}
					// ^^^^ ---------- disable these lines to try a different, maybe better layout ---------
					this.__firstLevelGenerated__ = true;
				}, this.__firstLevelGenerated__ ? 0 : this.__firstLevelDelayHack);
			}
		}

	}

	createButton(id, name, hasChildren, path, parent) {
		let button = document.createElement('div');
		button.__custom_clicked = false;
		button.__custom_busy = false;
		button.classList.add(this.names.BUTTON);
		let hand = document.createElement('div');
		hand.classList.add(this.names.BUTTON_HAND);
		button.append(hand);

		button.setAttribute('data-category-id', id);
		let inner = document.createElement('div');
		inner.classList.add(this.names.BUTTON_CONTAINER);
		let title = document.createElement('span');
		title.classList.add(this.names.BUTTON_TITLE);
		title.innerHTML = name;
		inner.append(title);
		inner.innerHTML += '<span class="categoryElement_subTitle"> Products: 123 </span> ';
		hand.style.position = "relative";
		button.append(inner);
		parent.append(button);

		console.log('hand: ', inner.offsetHeight / 2, - hand.offsetHeight / 2 + 'px');
		hand.style.top = inner.offsetHeight / 2 - hand.offsetHeight / 2 + 'px';

		button.addEventListener('click', (e) => {
			let categoryElement = e.target.closest('.' + this.names.BUTTON);
			let parentLevel = e.target.closest('.' + this.names.LEVEL);
			if (!categoryElement.__custom_busy) {
				if (!categoryElement.__custom_clicked) {
					//find and remove all existing sub-levels
					let rightHand = parentLevel.querySelector('.' + this.names.BUTTON_RIGHTHAND);
					if (rightHand != null) rightHand.remove();
					let sublevels = parentLevel.querySelectorAll('.' + this.names.LEVEL);
					if (sublevels.length > 0) for (let lvl of sublevels) lvl.remove();
					let alreadyClickedButton = parentLevel.querySelector('.' + this.names.BUTTON_CLICKED);
					if (alreadyClickedButton != null) {
						alreadyClickedButton.__custom_clicked = false;
						alreadyClickedButton.classList.remove(this.names.BUTTON_CLICKED);
					}
					this._revertTop(path);
					categoryElement.classList.add(this.names.BUTTON_CLICKED);
					categoryElement.__custom_clicked = true;
					console.log(hasChildren);
					if (hasChildren) {
						let handRight = document.createElement('div');
						handRight.classList.add(this.names.BUTTON_RIGHTHAND);
						categoryElement.append(handRight);
					}
					this.createLevel(parentLevel, path, button.offsetTop, button.offsetHeight);
				} else {
					categoryElement.__custom_clicked = false;
					categoryElement.classList.remove(this.names.BUTTON_CLICKED);
					if (hasChildren) categoryElement.querySelector('.' + this.names.BUTTON_RIGHTHAND).remove();
					//an older button is clicked and the top offset is reverted appropriately
					if (path.length < this.displacements.length) this.rootLevel.style.top = this.displacements[path.length - 1] + 'px';
					this._revertTop(path);
					let childLevels = parentLevel.querySelectorAll('.' + this.names.LEVEL);
					for (let lvl of childLevels) lvl.remove();
				}
			}
		});



		button.addEventListener('contextmenu', (e_context) => {
			// e.stopPropagation();
			e_context.preventDefault();
			if (button.__custom_clicked) {
				if (this.contextMenuOpen) this.buildTarget.querySelector('.' + this.names.CONTEXT_MENU).remove();
				this.contextMenuOpen = true;
				let contextMenu = document.createElement('div');
				contextMenu.style.position = "absolute";
				contextMenu.classList.add(this.names.CONTEXT_MENU);
				contextMenu.style.top = this.mouseY + 'px';
				contextMenu.style.left = this.mouseX + 'px';
				this.buildTarget.append(contextMenu);

				// ----- new option -------------------------------------
				let optionRename = document.createElement('div');
				optionRename.classList.add(this.names.CONTEXT_MENU_OPTION);
				optionRename.innerHTML = "<span> Rename </span>";
				if (button.__custom_busy) optionRename.classList.add(this.names.CONTEXT_MENU_OPTION_DISABLED);
				optionRename.addEventListener('click', (e_rename) => {
					if (!button.__custom_busy) {
						button.__custom_busy = true;
						button.classList.add(this.names.BUTTON_BUSY);
						button.querySelector('.' + this.names.BUTTON_TITLE).style.display = "none";
						let inputRename = document.createElement('input');
						inputRename.classList.add(this.names.BUTTON_INPUT);
						let cancelRename = document.createElement('span');
						cancelRename.innerText = "🞭";
						cancelRename.addEventListener('click', (e_cancel) => {
							button.classList.remove(this.names.BUTTON_BUSY);
							button.__custom_busy = false;
							button.querySelector('.' + this.names.BUTTON_TITLE).style.display = "block";
							button.querySelector('form').remove();
							e_cancel.target.remove();

						})
						inner.insertBefore(cancelRename, inner.firstChild);
						let buttonForm = document.createElement('form');
						buttonForm.append(inputRename);
						buttonForm.addEventListener('submit', (e_form) => {
							e_form.preventDefault();
							//do xhr			



							return false;
						});
						inner.insertBefore(buttonForm, inner.firstChild);
						inputRename.focus();
						title.style.display = "none";
						this.buttonWithInput = button;
					}
				});
				// ----- new option -------------------------------------
				let optionDelete = document.createElement('div');
				optionDelete.classList.add(this.names.CONTEXT_MENU_OPTION);
				optionDelete.innerHTML = "<span> Delete </span>";

				optionDelete.addEventListener('click', (e_delete) => {
					console.log(888);
				});
				// ----- new option -------------------------------------
				let optionAddCategory = document.createElement('div');
				optionAddCategory.classList.add(this.names.CONTEXT_MENU_OPTION);
				optionAddCategory.innerHTML = "<span> Add Subcategory </span>";
				optionAddCategory.addEventListener('click', (e_addCategory) => {
					let modal = createModal(document.querySelector('body'));
					modal.innerHTML = `
					<form class="form-simple" onsubmit="return false;"
					data-content-id="shop-appearence-1" data-form-action="setProperty" novalidate>
					<div class="label_item">
						<label class="label_set">Shop full name <input class="testing" type="text"
								name="shop-appearence-1" data-content-id="shop-appearence-1"
								spellcheck=false required /> </label>
						<span class="input_error_msg"> Invalid name. </span>
						<span class="label_item_description">Lorem ipsum Lorem ipsum dolor sit amet,
							consectetuer adipiscing elit.</span>
					</div>
					<div class="form_buttons_container">
						<button class="form_button form_button_disabled" type="submit"
							disabled>Save</button>
						<button class="form_button form_undo_button" type="button"
							value="Save">Undo</button>
						<div class="form_status_container">
							<div class="loading_container">
								<img src="./loading.svg">
							</div>
							<span class="form_status_info"></span>
						</div>
					</div>
				</form>
					`;
					modal.querySelectorAll('input')[0].focus();
				});

				contextMenu.append(optionRename);
				contextMenu.append(optionDelete);
				contextMenu.append(optionAddCategory);

			}
		});

		return button.offsetHeight + parseFloat(window.getComputedStyle(button).marginBottom.split('px')[0]);
	}

	_revertTop(path) {
		let revert = 0;
		for (let i = this.displacements.length - 1; i >= path.length - 1; i--) {
			revert += Math.abs(this.displacements[i]);
			this.displacements.pop();
		}
		this.currentTop = this.currentTop - revert;
		this.rootLevel.style.top = this.currentTop + 'px';
	}

	__put(data) {
		this.tree = data;
	}


}

module.exports = UIComponentCategoriesTree;