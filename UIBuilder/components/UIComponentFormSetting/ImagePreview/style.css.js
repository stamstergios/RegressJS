module.exports = (namespace) => {
    return /*css*/`

	


    .${namespace.PREVIEW_IMAGE_CONTAINER} {
        /* width: 50%; */
        display: inline-block;
        width: 200px;
        height: 200px;
        text-align: center;
        /* border: 2px solid #262262; */
        padding: 5px;
        margin: 10px;
        vertical-align: top;
    
    }
    
    .${namespace.IMAGE_CONTAINER_BOTTOM_SELECTED} {
        border: 2px solid #262262;
    }

    .${namespace.PREVIEW_IMAGE_CONTAINER_TOP}{
        margin-bottom: 5px;
    }

    
    .${namespace.PREVIEW_IMAGE} {
        vertical-align: top;
        max-width: 180px;
        max-height: 180px;
        /* margin-right: 20px; */
    
    }
    
    .${namespace.DELETE_IMAGE_BUTTON} {
        cursor: pointer;
    }

    .${namespace.IMAGE_CONTAINER_BOTTOM}{

    }
    
    .${namespace.IMAGE_ORIGINAL_FILENAME} {
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 150px;
    }
    
    .imageFileName span {
        font-size: 80%;
    
    }
    
    
    
    .${namespace.PROGRESS_BAR_WRAPPER} {
    
        display: inline-block;
        /* background-color: #262262; */
        color: #262262;
        height: 10px;
        width: 150px;
        accent-color: #262262;
    
    }



    
`;
}