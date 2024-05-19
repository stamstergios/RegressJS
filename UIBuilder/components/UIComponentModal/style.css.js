module.exports = (namespace) => {
	return /*css*/`

		.${namespace.MODAL}{
			color: #262262;
		}
		.${namespace.MODAL}{
			box-shadow: 5px 5px 60px rgba(0,0,0,0.2);
			width: 60%;
			height: auto;
			position: absolute;
			background-color: #D1D3D4;
			top: 0;
			border: 4px solid #262262;
			min-height: 200px;
		}

		.${namespace.MODAL_BACKDROP}{
			width: 100%;
			height: 100%;
			position: fixed;
			top: 0;
			left: 0;
			background: rgba(0,0,0,0.5);
			
		}

		.${namespace.MODAL_HEADER}{
			height: 50px;
		}

		.${namespace.MODAL_INNER_CONTAINER}{
			padding-left: 30px;
			padding-right: 30px;
		}

		.${namespace.MODAL_CLOSEBUTTON}{
			cursor: pointer;
			font-size: 24px;
			margin: 10px;
			float: right;
		}

		.${namespace.MODAL_CLOSEBUTTON}:hover{
			color: #ccc;
		}
	`;
};