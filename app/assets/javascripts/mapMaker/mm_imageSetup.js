
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



MapMaker.image.deleteToHistory = function() {

}

MapMaker.image.updateToHistory = function() {

}

// Creates a image DOM element
MapMaker.image.makeEl = function(x, y, cast_id, url) {
        return $("<div class=\"cimage\" style=\"left:"+x+"px; top: "+y+"px; \"></div>");
    // return $("<img src=\""+url+"\" class=\"cimage\" style=\"left:"+x+"px; top: "+y+"px; \">");
}


    // ------------------------------------------------------------
////// IMAGE LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

// Loads all event handlers for existing DOM objects
MapMaker.image.loadListeners = function() {

}

// Given a newly created temp image DOM object or existing, adds the listeners onto it
MapMaker.image.addListeners = function(imageEl, isTemp) {

}


