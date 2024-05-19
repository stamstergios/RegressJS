module.exports = (namespace) => {

	return /*css*/`

	.${namespace.TREESELECT} .${namespace.LEVEL_CONTAINER} {
		display: inline-block;
		vertical-align: top;
		position: absolute;
		/* left: 50px; */
		top: 0px;
		/* margin-left: 5px; */
		min-width: 105%;
		
	
		/* overflow: hidden; */
	}
	
	.${namespace.TREESELECT} .${namespace.INNER_CONTAINER} {
		/* position: relative;
		display: inline-block; */
	}
	
	.${namespace.TREESELECT} {
		position: absolute;
		display: block;
		margin-top: -5px;
		margin-left: 3px;
		/* font-size: 90%; */
		z-index: 1000;
		/* width: 100px;
		height: 100px; */
	
	}
	
	
	.${namespace.TREESELECT} .${namespace.ITEM}:hover {
		background-color: #ddd;
	}
	
	.${namespace.TREESELECT} .${namespace.ITEM} {
		padding: 2px;
		padding-left: 4px;
		padding-right: 5px;
		display: block;
		cursor: default;
		font-size: 85%;
	}
	
	.${namespace.TREESELECT} .${namespace.ITEM_WITH_SUBLEVELS}:hover::after {
		content: "►";
		font-size: 70%;
		float: right;
		padding-top: 3px;
	}
	
	.${namespace.TREESELECT} .${namespace.LEVEL} {
		position: relative;
		background-color: white;
		border: 2px solid #262262;
		box-shadow: 3px 3px 0px #262262;
		/* overflow: hidden; */
		max-width: 200px;
		text-overflow: ellipsis;
	}
	
	.${namespace.TREESELECT} .${namespace.ITEM_LEAF} {
		cursor: pointer;
	
	}
	
	.${namespace.TREESELECT} .${namespace.ITEM_LEAF}:hover::after {
		content: "";
	}
	
	.${namespace.TREESELECT} .${namespace.ITEM_LEAF}:hover {
		color: white;
		background-color: #262262;
	}
	
	
	.${namespace.CONTROL_CONTAINER} {
		display: inline-block;
		padding: 3px;
		font-size: 95%;
	}
		
	.${namespace.CONTROL_BUTTON} {
		font-size: 92%;
		background-color: white;
		/* height: 20px; */
		border: 2px solid #262262;
		display: inline-block;
		padding: 4px;
		cursor: pointer;
	}
	
	.${namespace.CONTROL_BUTTON}:hover,
	.${namespace.CONTROL_BUTTON}:focus {
		background-color: #262262;
		color: white;
	}
	
	.${namespace.CONTROL_BUTTON}:hover::after,
	.${namespace.CONTROL_BUTTON}:focus::after {
		content: "▼";
		font-size: 85%;
		padding-left: 3px;
	}
	
	.${namespace.CONTROL_BUTTON}::after {
		content: "►";
		padding-left: 3px;
	
	}
	
	.${namespace.CONTROL_BUTTON_CLICKED} {
		background-color: #262262;
		color: white;
	
	}
	
	.${namespace.CONTROL_BUTTON_CLICKED}::after {
		content: "▼";
		font-size: 85%;
		padding-left: 3px;
	
	}
	
	.${namespace.NOT_SELECTED} {
		font-style: italic;
	
	}
	
	.${namespace.CONTROL_BUTTON} .${namespace.NAMES_CHAIN_ITEM} {
		font-size: inherit;
	}
	
	.${namespace.CONTROL_BUTTON} .${namespace.NAMES_CHAIN_ITEM}:last-child {
		font-weight: bold;
	}








	`;
};