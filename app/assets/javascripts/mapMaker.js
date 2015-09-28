// This js is only loaded on /maps/{:id}/craft
// It's only used there and we shouldn't ever load it on other pages b/c lag
// If you really want to use it on another page -> <%= javascript_include_tag "mapMaker.js" %>


// We can grab controller vars before dom is loaded FYI


console.log(gon.map);

$(document).ready(function() {

    $("#workArea").css("width", gon.map.width);
    $("#workArea").css("height", gon.map.height);

    mapMaker($("#workArea"), $("#toolBar"));

    $("#save").click(function() {
        $.ajax({
          type: "POST",
          url: "/maps/"+gon.map.id+"/save",
          data: {
            actionHistory: JSON.stringify(actionHistory)
          }
        });
    })


})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CONSTANTS + GLOBALS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var TOOLS = {
    RECTANGLE : "rectangle",
    ERASER : "eraser",
    SELECT: "select"
}

var ACTIONS = { // Used to store action for history
    CREATE : "create",
    UPDATE : "update",
    DELETE : "delete"
}

var TYPES = { // Used to store what object we'll want to use
    MAP : "map",
    TAG : "tag",
    VENDOR : "vendor",
    BOOTH : "booth",
    VENDOR_TAG : "vendor_tag",
    VENDOR_BOOTH : "vendor_booth"
}

var actionHistory = []; // Store create, update action objs in here in order of occurance

// TODO: USE CASE -> Temp booth created. Other stuff happens. Temp booth modified. Other stuff. Finally, temp booth deleted...
// We won't know the ID of the temp booth since it, currently, gets created as per history
// To FIX: We can get the ID of the last booth saved on the map via gon. Then, as we insert new booths, we assign a temporary
// data-id attribute which is the last ID incremented. 

// Then we save deletes as well, and don't create in first place if the temp obj gets deleted later.
// We also do the same for updates for temp objs -> if temp obj updated, in backend, we just change the create statement to the 
// new state


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


function mapMaker(workArea, toolBar) {

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // VARIABLES
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    var selectedTool; // Which tool is the user currently using
    var toolContext = {}; // Store information about interactions as needed

    var workArea = workArea;
    var toolBar = toolBar;

    // Vendors/tags/booths/vendor_tags that haven't been saved to the system are given a temp ID
    // that allows us to not waste effort creating/updating objs that are deleted anyway
    var lastVendorId = gon.vendors.length > 0 ? gon.vendors[gon.vendors.length - 1].id : 0;
    // var lastTagId;
    // var lastVendorTagId;
    var lastBoothId = gon.booths.length > 0 ? gon.booths[gon.booths.length - 1].id : 0;


    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // EVENT LISTENERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // ------------------------------
    // CLICK
    workArea.click(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                break;
            default:
        }
    })

    $(".tool").click(function(e) { // Swap tool when tool button pressed
        selectedTool = this.dataset.type;
    })

    $(".booth").mousedown(function(e) {
        switch(selectedTool) {
            case TOOLS.ERASER:
                deleteBoothToHistory($(this), false);
                this.remove();
                break;
            case TOOLS.SELECT:
                startMoveBooth($(this), e);
                break;
            default:
        }
    })

    $(".booth").mouseup(function(e) {
        switch(selectedTool) {
            case TOOLS.SELECT:
                endMoveBooth($(this), e, false);
                break;
            default:
        }
    })

    // ------------------------------
    // MOUSEDOWN
    workArea.mousedown(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                startBooth(e);
                break;
            default:
        }
    })



    // ------------------------------
    // MOUSEUP
    workArea.mouseup(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                finishBooth(e);
                break;
            default:
        }
    })


    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // FUNCTIONS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // ------------------------------
    // BOOTH

    // Attaches all required event listeners to a booth element
    function addBoothListeners(boothEl) {
        boothEl.mousedown(function(e) {
            switch(selectedTool) {
                case TOOLS.ERASER:
                    deleteBoothToHistory(boothEl, true);
                    boothEl.remove()
                    break;
                case TOOLS.SELECT:
                    startMoveBooth(boothEl, e);
                    break;
            }
        })
        boothEl.mouseup(function(e) {
            switch(seletectedTool) {
                case TOOLS.SELECT:
                    endMoveBooth(boothEl, e, true);
                    break;
            }
        })
    }

    function startBooth(e) {
        var offset = workArea.offset();
        toolContext.downX = e.pageX - offset.left;
        toolContext.downY = e.pageY - offset.top;
        lastBoothId++;

        toolContext.newBooth = $("<div class=\"booth\" style=\"left:"+toolContext.downX+"px;top:"+toolContext.downY+"px\""+
                                 "data-id=\""+lastBoothId+"\"></div>");
        $("#workArea").append(toolContext.newBooth);

        workArea.mousemove(function(e) {
            toolContext.moveX = e.pageX - offset.left;
            toolContext.moveY = e.pageY - offset.top;

            var topLeft = findTopLeft(toolContext.downX, toolContext.downY, toolContext.moveX, toolContext.moveY);
            var width = findWidth(toolContext.downX, toolContext.moveX);
            var height = findHeight(toolContext.downY, toolContext.moveY);

            toolContext.newBooth.css("left", topLeft[0]);
            toolContext.newBooth.css("top", topLeft[1]);
            toolContext.newBooth.css("width", width);
            toolContext.newBooth.css("height", height);
        });
    }

    function finishBooth(e) {
        workArea.off("mousemove"); // Stop listening for mouse move
        addBoothToHistory(toolContext.newBooth);
        addBoothListeners(toolContext.newBooth);
    }

    function startMoveBooth(boothEl, e) {
        var offset = workArea.offset();

        toolContext.startX = parseInt(boothEl.css("left"));
        toolContext.startY = parseInt(boothEl.css("top"));

        toolContext.downX = e.pageX - offset.left;
        toolContext.downY = e.pageY - offset.top;

        workArea.mousemove(function(e) {
            toolContext.shiftX = (e.pageX - offset.left) - toolContext.downX;
            toolContext.shiftY = (e.pageY - offset.top) - toolContext.downY;

            boothEl.css("left", toolContext.startX + toolContext.shiftX);
            boothEl.css("top", toolContext.startY + toolContext.shiftY);
        });
    }

    function endMoveBooth(boothEl, e, isTemp) {
        workArea.off("mousemove"); // Stop listening for mouse move
        updateBoothToHistory(boothEl, isTemp);
    }

    // Log creating a booth into our history array
    function addBoothToHistory(boothEl) {
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

    function updateBoothToHistory(boothEl, isTemp) {
        var left = parseInt(boothEl.css("left"));
        var top = parseInt(boothEl.css("top"));
        var width = parseInt(boothEl.css("width"));
        var height = parseInt(boothEl.css("height"));
        var boothHistory = {
            "action" : ACTIONS.UPDATE,
            "type" : TYPES.BOOTH,
            "id" : boothEl.data("id"),
            "x" : left,
            "y" : top,
            "width" : width,
            "height" : height
        }
        if (isTemp) { // Deleted temp obj that was never saved. Keep track of this
            boothHistory["isTemp"] = true;
        }
        actionHistory.push(boothHistory);
    }

    // Log deleting a booth into our history array.
    function deleteBoothToHistory(boothEl, isTemp) {
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

    // ------------------------------
    // HELPERS
    
    // Given two sets of x, y that define the zone of a rectangle, returns topleft coords as [x,y] 
    function findTopLeft(x1, y1, x2, y2) {
        var x = x1 < x2 ? x1 : x2;
        var y = y1 < y2 ? y1 : y2;
        return [x, y];
    }

    // Given two x points defining horizonal of a rectangle, returns width
    function findWidth(x1, x2) {
        return Math.abs(x1 - x2);
    }

    // Given two y points defining vertical of a rectangle, returns height
    function findHeight(y1, y2) {
        return Math.abs(y1 - y2);
    }



}


// PLAN

// Store action HISTORY as JS and on save press, we pass a JSON object in with information needed to save
// state of the map

// We will save objects in a history array and as we undo, we pop. Redo, push something back on.
// Certain actions in our DB need to happen in order.  Vendors and tags made first, then vendor tags. Finally, booths.

// In addition, we need to store the current 'tool' as this influences what action happens when the work area is clicked.













