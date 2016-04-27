
// Cast and Image listeners, event handlers, functions for MapMaker
// Handler of ajax, creation, deletion, and more of user images
// Accessing  => MapMaker.image.<functionName>

MapMaker.image = {};

MapMaker.image.addToHistory = function(x, y, cast_id) {
    var imageHistory = {
        "action" : ACTIONS.CREATE,
        "type" : TYPES.IMAGE,
        "id" : "t" + MapMaker.lastImageId,
        "x" : x,
        "y" : y,
        "layer" : LAYERS.BELOW_BOOTH, // TODO: Change default
        "cast_id" : cast_id
    }
    actionHistory.push(imageHistory);
}

// Adds a delete image action to the history array
MapMaker.image.deleteToHistory = function(imageEl, isTemp) {
    // TODO : CHECK IF ID GETTING IS OK, ALSO NEED TO ADD DELETE CLASS!!!
    debugger;
    var imageHistory = {
        "action" : ACTIONS.DELETE,
        "type" : TYPES.IMAGE,
        "id" : imageEl.data("id")
    }
    if (isTemp) {
        imageHistory["isTemp"] = true;
    }
    actionHistory.push(imageHistory);
    imageEl.addClass("deleted");
}

MapMaker.image.updateToHistory = function() {

}

// Creates a image DOM element
MapMaker.image.makeEl = function(x, y, cast_id, url) {
    var imageEl = $("<div class=\"cimage\" style=\"left:"+x+"px; top: "+y+"px;\""+
                        " data-id=\""+ MapMaker.lastImageId +"\" data-castid=\""+cast_id+"\">"+
                        "<img src=\""+url+"\">"+
                        "<a href=\"javascript:;\" class=\"destroy_image\">"+
                            "<i class=\"fa fa-times\"></i>"+
                        "</a>"+
                    "</div>");
    MapMaker.lastImageId++;
    return imageEl;
}


    // ------------------------------------------------------------
////// IMAGE LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

// Loads all event handlers for existing DOM objects
MapMaker.image.loadListeners = function() {
    MapMaker.image.addListeners($(".cimage"), false);
}

// Given a newly created temp image DOM object or existing, adds the listeners onto it
MapMaker.image.addListeners = function(imageEl, isTemp) {
    MapMaker.image.addListener_click(imageEl, isTemp);

}

MapMaker.image.addListener_click = function(imageEl, isTemp) {
    imageEl.children(".destroy_image").click(function() {
        if (!isTemp) { imageEl = $(this).parent(); }
        MapMaker.image.deleteToHistory(imageEl, isTemp);
    })
}


