// This js is only loaded on /maps/{:id}/craft
// It's only used there and we shouldn't ever load it on other pages b/c lag
// If you really want to use it on another page -> <%= javascript_include_tag "mapMaker.js" %>


// We can grab controller vars before dom is loaded FYI


console.log(gon.map);

$(document).ready(function() {

    $("#workArea").css("width", gon.map.width);
    $("#workArea").css("height", gon.map.height);

    mapMaker($("#workArea"), "");

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
// CONSTANTS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var TOOLS = {
    RECTANGLE : "rectangle"
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
    VENDOR_TAG : "vendor_tag"
}

var actionHistory = []; // Store objs in here in order of occurance


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


function mapMaker(workArea, toolBar) {

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // VARIABLES
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    var selectedTool = TOOLS.RECTANGLE; // Which tool is the user currently using, default to rectangle
    var toolContext = {}; // Store information about interactions as needed

    var workArea = workArea;
    var toolBar = toolBar;


    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // EVENT LISTENERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // ------------------------------
    // CLICK
    workArea.click(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                // code
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
    function startBooth(e) {
        var offset = workArea.offset();
        toolContext.downX = e.pageX - offset.left;
        toolContext.downY = e.pageY - offset.top;

        var newBooth = $("<div class=\"booth\" style=\"left:"+toolContext.downX+"px;top:"+toolContext.downY+"px\"></div>");
        $("#workArea").append(newBooth);

        workArea.mousemove(function(e) {
            toolContext.moveX = e.pageX - offset.left;
            toolContext.moveY = e.pageY - offset.top;

            var topLeft = findTopLeft(toolContext.downX, toolContext.downY, toolContext.moveX, toolContext.moveY);
            var width = findWidth(toolContext.downX, toolContext.moveX);
            var height = findHeight(toolContext.downY, toolContext.moveY);

            newBooth.css("left", topLeft[0]);
            newBooth.css("top", topLeft[1]);
            newBooth.css("width", width);
            newBooth.css("height", height);
        });

    }

    function finishBooth(e) {
        // Stop listening for mouse move
        addBoothToHistory();
        workArea.off("mousemove");
    }

    // Log creating a booth into our history array
    function addBoothToHistory() {
        var topLeft = findTopLeft(toolContext.downX, toolContext.downY, toolContext.moveX, toolContext.moveY);
        var width = findWidth(toolContext.downX, toolContext.moveX);
        var height = findHeight(toolContext.downY, toolContext.moveY);
        var boothHistory = {
            "action" : ACTIONS.CREATE,
            "type" : TYPES.BOOTH,
            "x" : topLeft[0],
            "y" : topLeft[1],
            "width" : width,
            "height" : height
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













