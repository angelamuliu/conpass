
// Booth listeners, event handlers, functions for MapMaker
// Accessing  => MapMaker.booth.<functionName>

MapMaker.booth = {};

MapMaker.booth.addToHistory = function(boothEl) {
    var left = parseInt(boothEl.css("left"));
    var top = parseInt(boothEl.css("top"));
    var width = parseInt(boothEl.css("width"));
    var height = parseInt(boothEl.css("height"));
    var boothHistory = {
        "action" : ACTIONS.CREATE,
        "type" : TYPES.BOOTH,
        "id" : boothEl.data("id"),
        "x" : left,
        "y" : top,
        "width" : width,
        "height" : height,
        "isTemp" : true
    }
    actionHistory.push(boothHistory);
}

// Adds a delete booth action to the history array
MapMaker.booth.deleteToHistory = function(boothEl, isTemp) {
    var boothHistory = {
        "action" : ACTIONS.DELETE,
        "type" : TYPES.BOOTH,
        "id" : boothEl.data("id")
    }
    if (isTemp) { // Deleted temp obj that was never saved. Keep track of this
        boothHistory["isTemp"] = true;
    }
    actionHistory.push(boothHistory);
}

// TODO - Add name when we get the form finished
// Log updating a booth into our history array
MapMaker.booth.updateToHistory = function (boothEl, isTemp) {
    var left = parseInt(boothEl.css("left"));
    var top = parseInt(boothEl.css("top"));
    var width = parseInt(boothEl.css("width"));
    var height = parseInt(boothEl.css("height"));
    // var name = boothEl.children(".booth_label").html();
    var boothHistory = {
        "action" : ACTIONS.UPDATE,
        "type" : TYPES.BOOTH,
        "id" : boothEl.data("id"),
        "x" : left,
        "y" : top,
        "width" : width,
        "height" : height
        // "name" : name
    }
    if (isTemp) { // Deleted temp obj that was never saved. Keep track of this
        boothHistory["isTemp"] = true;
    }
    actionHistory.push(boothHistory);
}

// Creates a booth DOM element
MapMaker.booth.makeEl = function(left, top, id, width, height) {
    width = width === undefined ? 0 : width;
    height = height === undefined ? 0 : height;
    return $("<div class=\"booth\" style=\"left:"+left+"px; top:"+top+"px; width:"+width+"px; height:"+height+"px;\""+
             "data-id=\"t"+id+"\" tabindex=1>" + 
                "<div class=\"booth_label\" onclick=\"\"></div>" +
                "<ul class=\"unordered vendorBooth\">" + 
                    "<li>Vendors assigned to this booth<a href=\"javascript:;\" class=\"close_vendorBooth\">" + 
                        "<i class=\"fa fa-times\"></i></a>"+
                    "</li>" + 
                    "<li class=\"no_vendorBooths\">No vendors assigned</li>"+
                "</ul>" +
            "</div>");
}

// Handles start of drag interaction when a user is making a booth
MapMaker.booth.startMake = function(e) {
    var offset = MapMaker.workArea.offset();
    toolContext.downX = e.pageX - offset.left;
    toolContext.downY = e.pageY - offset.top;
    MapMaker.lastBoothId++;

    toolContext.newBooth = MapMaker.booth.makeEl(toolContext.downX, toolContext.downY, MapMaker.lastBoothId);
    MapMaker.workArea.append(toolContext.newBooth);

    MapMaker.workArea.mousemove(function(e) {
        toolContext.moveX = e.pageX - offset.left;
        toolContext.moveY = e.pageY - offset.top;

        var topLeft = MapMaker.findTopLeft(toolContext.downX, toolContext.downY, toolContext.moveX, toolContext.moveY);
        var width = MapMaker.findWidth(toolContext.downX, toolContext.moveX);
        var height = MapMaker.findHeight(toolContext.downY, toolContext.moveY);

        toolContext.newBooth.css("left", topLeft[0]);
        toolContext.newBooth.css("top", topLeft[1]);
        toolContext.newBooth.css("width", width);
        toolContext.newBooth.css("height", height);
    });
}

// Renamed from finishbooth()
MapMaker.booth.endMake = function(e) {
    MapMaker.workArea.off("mousemove"); // Stop listening for mouse move
    if (MapMaker.booth.bigEnough()) {
        MapMaker.booth.addToHistory(toolContext.newBooth);
        MapMaker.booth.addListeners(toolContext.newBooth, true);
    }
}

MapMaker.booth.startMove = function(boothEl, e) {
    var offset = MapMaker.workArea.offset();

    toolContext.startX = parseInt(boothEl.css("left"));
    toolContext.startY = parseInt(boothEl.css("top"));

    toolContext.downX = e.pageX - offset.left;
    toolContext.downY = e.pageY - offset.top;

    MapMaker.workArea.mousemove(function(e) {
        toolContext.shiftX = (e.pageX - offset.left) - toolContext.downX;
        toolContext.shiftY = (e.pageY - offset.top) - toolContext.downY;

        boothEl.css("left", toolContext.startX + toolContext.shiftX);
        boothEl.css("top", toolContext.startY + toolContext.shiftY);
    });
}

MapMaker.booth.endMove = function(boothEl, e, isTemp) {
    MapMaker.workArea.off("mousemove"); // Stop listening for mouse move\
    MapMaker.booth.updateToHistory(boothEl, isTemp);
}

// Stores a booth in preparation for possible pasting
MapMaker.booth.copy = function (boothEl) {
    toolContext.clipboard = boothEl;
}

MapMaker.booth.paste = function() {
    if (toolContext.clipboard !== undefined) {
        MapMaker.lastBoothId++;
        var left = parseInt(toolContext.clipboard.css("left"));
        var top = parseInt(toolContext.clipboard.css("top"));
        var width = parseInt(toolContext.clipboard.css("width"));
        var height = parseInt(toolContext.clipboard.css("height"));

        var clone = MapMaker.booth.makeEl(left + 10, top + 10, MapMaker.lastBoothId, width, height);
        
        MapMaker.booth.addListeners(clone, true);
        MapMaker.workArea.append(clone);
        MapMaker.booth.addToHistory(clone);

        // Finally, switch focus and 'clicpboard' to newly copied object
        toolContext.clipboard = clone;
        clone.focus();
    }
}

// Don't create booths if they are below a certain point
MapMaker.booth.bigEnough = function() {
    var width = parseInt(toolContext.newBooth.css("width"));
    var height = parseInt(toolContext.newBooth.css("height"));
    if (width < 25 && height < 25) {
        toolContext.newBooth.remove();
        return false;
    }
    return true;
}

    // ------------------------------------------------------------
////// BOOTH LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

// Loads all event handlers for existing DOM objects
MapMaker.booth.loadListeners = function() {
    MapMaker.booth.addListeners($(".booth"), false);
}

// Given a newly created temp booth DOM object or existing, adds the listeners onto it
MapMaker.booth.addListeners = function(boothEl, isTemp) {
    MapMaker.booth.addListener_mousedown(boothEl, isTemp);
    MapMaker.booth.addListener_mouseup(boothEl, isTemp);
    MapMaker.booth.addListener_dragenter(boothEl);
    MapMaker.booth.addListener_dragleave(boothEl);
    MapMaker.booth.addListener_dragover(boothEl);
    MapMaker.booth.addListener_drop(boothEl, isTemp);
    MapMaker.booth.addListener_keydown(boothEl, isTemp);
    MapMaker.booth.addListener_keyup(boothEl);

    // TODO: Investigate why this one is handled differently from temp to perm
    boothEl.find(".close_vendorBooth").click(function() {
        $(this).closest("ul").hide()

    })
}

// Attaches mousedown event listeners to booth element(s)
MapMaker.booth.addListener_mousedown = function(boothEl, isTemp) {
    boothEl.mousedown(function(e) {
        if (!isTemp) { boothEl = $(this); } // Using $(".booth") for en masse assignment
        switch(MapMaker.selectedTool) {
            case TOOLS.ERASER:
                MapMaker.booth.deleteToHistory(boothEl, isTemp);
                // TODO
                // deleteVendorBoothFromBooth(boothEl);
                boothEl.addClass("deleted");
                break;
            case TOOLS.SELECT:
                MapMaker.booth.startMove(boothEl, e);
                break;
            case TOOLS.INFOSELECT:
                // TODO
                if (toolContext.vendorBooth) { toolContext.vendorBooth.hide(); }
                toolContext.vendorBooth = boothEl.children(".vendorBooth");
                toolContext.vendorBooth.show();
                break;
        }
    })

    // WIP
    boothEl.find(".edit_booth_name").mousedown(function(e) {
        if (!isTemp) { boothEl = $(this); }
        debugger;
        // Move the form to where person just clicked
        $("form#boothName_Form").css("left",  e.pageX);
        $("form#boothName_Form").css("top", e.pageY - 25);

        // Prefill the existing value into the form
        var currName = boothEl.parent().find("span").html().trim();
        $("form#boothName_Form input").first().val(currName);

    })
}

MapMaker.booth.addListener_mouseup = function(boothEl, isTemp) {
    boothEl.mouseup(function(e) {
        if (!isTemp) { boothEl = $(this); }
        switch(MapMaker.selectedTool) {
            case TOOLS.SELECT:
                MapMaker.booth.endMove(boothEl, e, isTemp);
                break;
        }
    })
}

MapMaker.booth.addListener_dragenter = function(boothEl) {
    boothEl.on("dragenter", function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
}

MapMaker.booth.addListener_dragleave = function(boothEl) {
    boothEl.on("dragleave", function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
}

MapMaker.booth.addListener_dragover = function(boothEl) {
    boothEl.on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    })
}

MapMaker.booth.addListener_drop = function(boothEl, isTemp) {
    boothEl.on("drop", function(e, ui) {
        if (!isTemp) { boothEl = $(this); }

        e.preventDefault();
        e.stopPropagation();

        var vendorBooth_formEl = $("#vendorbooth_form");
        MapMaker.resetForm(vendorBooth_formEl);

        MapMaker.vendorBooth.prepForm(vendorBooth_formEl);
        MapMaker.vendorBooth.showForm(vendorBooth_formEl);

        toolContext.vendorBoothAction = ACTIONS.CREATE;
        toolContext.boothId = boothEl.data("id");
        toolContext.boothEl = boothEl;
    })
}

MapMaker.booth.addListener_keydown = function(boothEl, isTemp) {
    boothEl.keydown(function(e) {
        MapMaker.senseKeyDown(e, $(this));
    })
}

MapMaker.booth.addListener_keyup = function(boothEl) {
    boothEl.keyup(function(e) {
        MapMaker.senseKeyUp(e);
    })
}

    // ------------------------------------------------------------
////// BOOTH MISC FUNCTIONS
    // ------------------------------------------------------------

MapMaker.booth.dismiss_name_form = function() {
    debugger;
}


