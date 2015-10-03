// This js is only loaded on /maps/{:id}/craft
// It's only used there and we shouldn't ever load it on other pages b/c lag
// If you really want to use it on another page -> <%= javascript_include_tag "mapMaker.js" %>


// We can grab controller vars before dom is loaded FYI
// console.log(gon.map);

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
////// EVENT LISTENERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    // ------------------------------------------------------------
////// CLICK
    // ------------------------------------------------------------

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

    $(".overlay").click(function() {
        $(this).hide();
        resetForm($(this).children("form"));
    })

    $(".close_overlay").click(function(e) {
        $(this).closest("div.overlay").hide();
        resetForm($(this).closest("form"));
        e.preventDefault();
        return false;
    })

    $(".overlay form").click(function(e) {
        e.stopPropagation();
    })

    $("#vendor_form_submit").click(function(e) {
        var formEl = $(this).parent();
        if (validateVendorFields(formEl)) {
            if (toolContext.vendorAction === ACTIONS.CREATE) { // Add vendor to DOM + log history
                var newVendorEl = addVendorToDOM();
                addVendorToHistory(newVendorEl);
                addVendorListeners(newVendorEl);
            } else if (toolContext.vendorAction === ACTIONS.UPDATE) { // Update vendor
                updateVendorToHistory(formEl);
                updateVendorInDom(toolContext.vendorEl);
            }
            $(this).closest("div.overlay").hide();
            resetForm(formEl);
        } else { 
            formEl.children("div.error").slideDown(300);
        }
        return false;
    })

    $("#toggle_vendors").click(function() {
        $("#vendor_list").toggle();
    })

    $("#add_vendor").click(function() {
        $("#vendor_form").parent().toggle();
        toolContext.vendorAction = ACTIONS.CREATE;
    })

    $(".vendorshow a").click(function() { // Clicking vendor name toggles its vendorshow_extra info
        $(this).parent().siblings().first().toggle();
    })

    $(".update_vendor").click(function() {
        toolContext.vendorEl = $(this).closest("li");
        prepVendorForm(toolContext.vendorEl, $("#vendor_form"));
        $("#vendor_form").parent().toggle();
        toolContext.vendorAction = ACTIONS.UPDATE;
        toolContext.isTemp = false;
        toolContext.vendorId = toolContext.vendorEl.data("id");
    })

    $(".destroy_vendor").click(function() {
        var vendorEl = $(this).closest("li");
        deleteVendorToHistory(vendorEl, false);
        deleteVendorInDom(vendorEl);
    })


    // ------------------------------------------------------------
////// MOUSEDOWN
    // ------------------------------------------------------------

    workArea.mousedown(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                startBooth(e);
                break;
            default:
        }
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


    // ------------------------------------------------------------
////// MOUSEUP
    // ------------------------------------------------------------

    workArea.mouseup(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                finishBooth(e);
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

    // ------------------------------------------------------------
////// DRAG EVENTS
    // ------------------------------------------------------------

    $(".drag_assign").on("dragstart", function(e) {
        var vendorId = $(this).closest("li").data("id");
        toolContext.vendorId = vendorId;
    })

    $(".booth").on("dragenter", function(e) {
        console.log("ENTEr");
        e.preventDefault();  
        e.stopPropagation();
    })

    $(".booth").on("dragleave", function(e) {
        console.log("LEAVE");
        e.preventDefault();  
        e.stopPropagation();
    })

    $(".booth").on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    })

    $(".booth").on("drop", function(e, ui) {
        toolContext.boothId = $(this).data("id");
        e.preventDefault();  
        e.stopPropagation();
        makeVendorBoothForm(ui);
    })

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
////// FUNCTIONS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    // ------------------------------------------------------------
////// BOOTH
    // ------------------------------------------------------------

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
            switch(selectedTool) {
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

    // Log updating a booth into our history array
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


    // ------------------------------------------------------------
////// VENDOR
    // ------------------------------------------------------------

    // Attaches all required event listeners a vendor element
    function addVendorListeners(vendorEl) {
        vendorEl.find(".vendorshow a").click(function() { // Clicking vendor name toggles its vendorshow_extra info
            vendorEl.children(".vendorshow_extra").toggle();
        })

        vendorEl.find(".update_vendor").click(function() {
            toolContext.vendorEl = vendorEl;
            prepVendorForm(toolContext.vendorEl, $("#vendor_form"));
            $("#vendor_form").parent().toggle();
            toolContext.vendorAction = ACTIONS.UPDATE;
            toolContext.isTemp = true;
            toolContext.vendorId = toolContext.vendorEl.data("id");
        })

        vendorEl.find(".destroy_vendor").click(function() {
            deleteVendorToHistory(vendorEl, true);
            deleteVendorInDom(vendorEl);
        })
    }

    function validateVendorFields(formEl) {
        var inputs = formEl.find("input, textarea");
        // For now, we just validate that there is a name
        if (inputs.first().val().length < 1) {
            return false;
        }
        return true;
    }

    function addVendorToDOM() {
        lastVendorId++;
        var name = $("input[name='vendor_name']").val();
        var url = $("input[name='vendor_url']").val();
        var desc = $("textarea[name='vendor_desc']").val();

        var newVendorEl = $("<li data-id=\""+ lastVendorId + "\">" +
                            "<div class=\"vendorshow\">" + 
                                "<i class=\"fa fa-circle-o drag_assign\"></i>" +
                                "<a href=\"#\" class=\"vendor_name\">"+ name + "</a>" +
                                "<i class=\"fa fa-eye vendorview_off\"></i>" +
                            "</div>" +
                            "<div class=\"vendorshow_extra\">" + 
                                "<strong>URL: </strong><span class=\"vendor_url\">" + url + "</span>" + 
                                "<strong>Description: </strong><span class=\"vendor_desc\">" + desc + "</span>" + 
                                "<div class=\"vendor_tags\"></div>" + 
                                "<button class=\"update_vendor\">Update</button>" +
                                "<button class=\"destroy_vendor\">Destroy</button>" +
                            "</div></li>");
        $("#vendor_list ul").append(newVendorEl);
        return newVendorEl;
    }

    // Log creating a vendor into our history array
    function addVendorToHistory(formEl) {
        var name = $("input[name='vendor_name']").val();
        var url = $("input[name='vendor_url']").val();
        var desc = $("textarea[name='vendor_desc']").val();
        var vendorHistory = {
            "action" : ACTIONS.CREATE,
            "type" : TYPES.VENDOR,
            "id" : lastVendorId,
            "name" : name,
            "website_url" : url,
            "description" : desc,
            "isTemp" : true
        }
        actionHistory.push(vendorHistory);
    }

    function updateVendorInDom(vendorEl) {
        var name = $("input[name='vendor_name']").val();
        var url = $("input[name='vendor_url']").val();
        var desc = $("textarea[name='vendor_desc']").val();

        vendorEl.find(".vendor_name").text(name);
        vendorEl.find(".vendor_url").text(url);
        vendorEl.find(".vendor_desc").text(desc);
    }

    // Log updating a booth into our history array
    function updateVendorToHistory(formEl) {
        var name = $("input[name='vendor_name']").val();
        var url = $("input[name='vendor_url']").val();
        var desc = $("textarea[name='vendor_desc']").val();
        var vendorHistory = {
            "action" : ACTIONS.UPDATE,
            "type" : TYPES.VENDOR,
            "id" : toolContext.vendorId,
            "name" : name,
            "website_url" : url,
            "description" : desc
        }
        if (toolContext.isTemp) { // Updated temp obj that was never saved. Keep track of this
            vendorHistory["isTemp"] = true;
        }
        actionHistory.push(vendorHistory);
    }

    function deleteVendorInDom(vendorEl) {
        vendorEl.remove();
    }

    function deleteVendorToHistory(vendorEl, isTemp) {
        var vendorHistory = {
            "action" : ACTIONS.DELETE,
            "type" : TYPES.VENDOR,
            "id" : vendorEl.data("id")
        }
        if (isTemp) { // Deleted temp obj that was never saved. Keep track of this
            vendorHistory["isTemp"] = true;
        }
        actionHistory.push(vendorHistory);
    }


    // ------------------------------------------------------------
////// VENDOR BOOTH
    // ------------------------------------------------------------


// PLAN: All booths if they get assigned get an additional class added to them that has vendor ID
// If a booth has a vendor booth, then ... 

    function addVendorBoothToDom() {

    }

    function addVendorBoothToHistory() {
        var vendorId;
        var boothId;
        var startTime;
        var endTime;
        var vendorBoothHistory = {

        }
        actionHistory.push(vendorBoothHistory);
    }





    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
////// HELPERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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

    // Clears all inputs and hides all error divs
    function resetForm(formEl) {
        formEl.children("div.error").hide();
        var inputs = formEl.find("input, textarea");
        for (var i = 0; i < inputs.length; i++) {
            $(inputs[i]).val("");
        }
    }

    // Preps the vendor form with data from the vendor el
    function prepVendorForm(vendorEl, formEl) {
        var name = vendorEl.find(".vendor_name").text();
        var url = vendorEl.find(".vendor_url").text();
        var desc = vendorEl.find(".vendor_desc").text();

        formEl.find(".vendor_name").val(name);
        formEl.find(".vendor_url").val(url);
        formEl.find(".vendor_desc").val(desc);
    }


    // Given an event, gets a top left corner and edits the vendorBooth form DOM object
    function prepVendorBoothForm(uiPosition) {
        var x = event.pageX;
        var y = event.pageY;

    }

}











