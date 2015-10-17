// This js is only loaded on /maps/{:id}/craft
// It's only used there and we shouldn't ever load it on other pages b/c lag
// If you really want to use it on another page -> <%= javascript_include_tag "mapMaker.js" %>

// We can grab controller vars before dom is loaded FYI
// console.log(gon.map);

//= require jquery.datetimepicker


// TODO : Something that clears objs with the ".deleted" class b/c otherwise there
// might be millions if someone works in a like 1 hour session lol

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CONSTANTS + GLOBALS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var TOOLS = {
    RECTANGLE : "rectangle",
    ERASER : "eraser",
    SELECT: "select",
    INFOSELECT: "infoselect"
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


$(document).ready(function() {

    $("#workArea").css("width", gon.map.width);
    $("#workArea").css("height", gon.map.height);

    mapMaker($("#workArea"), $("#toolBar"));

})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



function mapMaker(workArea, toolBar) {

    $("#save").click(saveMap);

    function saveMap() {
        $.ajax({
          type: "POST",
          url: "/maps/"+gon.map.id+"/save",
          data: {
            actionHistory: JSON.stringify(actionHistory)
          },
          beforeSend: function() {
            showSaving();
          },
          error: function() {
            setTimeout(saveError, 300);
            setTimeout(hideSaving, 2000);
            actionHistory = []; // Clear history on save for now
          },
          success: function() {
            saveSuccessful();
            setTimeout(hideSaving, 500);
            actionHistory = []; // Clear history on save for now
          }
        });
    }


    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // VARIABLES
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    var selectedTool = TOOLS.SELECT; // Which tool is the user currently using, default is SELECT
    var toolContext = {}; // Store information about interactions as needed

    var vendorDict = {}; // {"vendor ID" : vendor name}; Updated and used in vendor tag creation
    var tagDict = {}; // {"tag ID" : tag name}; Updated and used in vendor tag creation

    var workArea = workArea;
    var toolBar = toolBar;

    // Vendors/tags/booths/vendor_tags that haven't been saved to the system are given a temp ID
    // stored in the data-id attr of an EL (all start with "t" ex "t1") that allows us to not waste
    // effort creating/updating objs that are deleted anyway and more complicated operations
    var lastVendorId = 0;
    var lastTagId = 0;
    var lastBoothId = 0;
    var lastVendorBoothId = 0;
    var lastVendorTagId = 0;


    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
////// INITIALIZERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('.datetimepicker').datetimepicker();

    loadVendorDict(gon.vendors);
    loadTagDict(gon.tags);


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
        $(".tool").removeClass("selectedTool");
        selectedTool = this.dataset.type;
        $(this).addClass("selectedTool");
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

    $(".close_strong_overlay").click(function(e) {
        $(this).closest("div.strong_overlay").hide();
        e.preventDefault();
        return false;
    })

    $(".dismiss_error").click(function(e) {
        $(this).closest(".error").slideUp();
        e.preventDefault();
        return false;
    })

    $(".overlay form").click(function(e) {
        e.stopPropagation();
    })

////// Map clicks
    $("#map_config").click(function() {
        $("#map_form").parent().show()
    })

    $("#map_form_submit").click(function(e) {
        var formEl = $(this).closest("form");
        var name = $("input[name='map_name']").val();
        var width = $("input[name='map_width']").val();
        var height = $("input[name='map_height']").val();
        var mapHistory = {
            "action" : ACTIONS.UPDATE,
            "type" : TYPES.MAP,
            "id" : gon.map.id,
            "name" : name,
            "width" : width,
            "height" : height,
            "isTemp" : false
        }
        actionHistory.push(mapHistory);
        saveMap();
    })


////// Vendor clicks

    $("#vendor_form_submit").click(function(e) {
        var formEl = $(this).closest("form");
        if (validateVendorFields(formEl)) {
            if (toolContext.vendorAction === ACTIONS.CREATE) { // Add vendor to DOM + log history
                addVendorToDOM();
                addVendorToHistory();

                // Add to our vendor dict so tag form has access later
                addToVendorDict("t" + lastVendorId, $("input[name='vendor_name']").val());

                toolContext.checkedAfter = checkedIntoSet("t" + lastVendorId, $("#vendor_form ul.assign_vendortags"), true);
                addVendorTagsToHistory();
                addVendorTagsToDom();
            } else if (toolContext.vendorAction === ACTIONS.UPDATE) { // Update vendor
                updateVendorToHistory(formEl);
                updateVendorInDom(toolContext.vendorEl);

                toolContext.checkedAfter = checkedIntoSet(toolContext.vendorEl.data("id"), $("#vendor_form ul.assign_vendortags"), true);
                updateVendorTagsToHistory();
                updateVendorTagsToDom();
            }
            $(this).closest("div.overlay").hide();
            resetForm(formEl);
        } else { // Error
            formEl.children("div.error").slideDown(300);
        }
        return false;
    })

    $("#toggle_vendors").click(function() {
        $("#vendor_list").toggle();
        $(this).toggleClass("open");
    })

    $("#add_vendor").click(function() {
        loadVendortagsIntoForm($("#vendor_form"), true);
        $("#vendor_form").parent().toggle();
        toolContext.vendorAction = ACTIONS.CREATE;
    })

    $(".vendorshow a").click(function() { // Clicking vendor name toggles its vendorshow_extra info
        $(this).parent().siblings().first().toggle();
    })

    $(".update_vendor").click(function() {
        toolContext.vendorEl = $(this).closest("li");
        toolContext.vendorAction = ACTIONS.UPDATE;
        toolContext.isTemp = false;
        toolContext.vendorId = toolContext.vendorEl.data("id");

        prepVendorForm(toolContext.vendorEl, $("#vendor_form"));
        loadVendortagsIntoForm($("#vendor_form"), true, toolContext.vendorEl);
        $("#vendor_form").parent().toggle();
    })

    $(".destroy_vendor").click(function() {
        var vendorEl = $(this).closest("li");
        deleteVendorToHistory(vendorEl, false);
        deleteVendorInDom(vendorEl);
    })

////// Vendor Booth clicks

    // Toggle highlighting of booths with a vendor
    $(".vendorview_toggle").click(function() {
        toggleVendorFilter($(this));
    })

    $("#vendorbooth_form_submit").click(function() {
        var formEl = $(this).parent();
        if (validateVendorBoothFields(formEl)) {
            if (toolContext.vendorBoothAction === ACTIONS.CREATE) {
                addVendorBoothToDom();
                addVendorBoothToHistory();
                updateDragAssignEl($("#vendor_list").find("li[data-id="+toolContext.vendorId+"]"));
            } else if (toolContext.vendorBoothAction === ACTIONS.UPDATE) {
                updateVendorBoothInDom();
                updateVendorBoothToHistory();
            }
            $(this).closest("div.overlay").hide();
            resetForm(formEl);
        } else { // Error
            formEl.children("div.error").slideDown(300);
        }
        return false;
    })

    $(".update_vendorBooth").click(function() {
        var vendorBooth_formEl = $("#vendorbooth_form");
        var vendorboothEl = $(this).closest(".vendorBooth");

        resetForm(vendorBooth_formEl);
        prepVendorBoothForm(vendorBooth_formEl, vendorboothEl);
        showVendorBoothForm(vendorBooth_formEl);

        toolContext.vendorBoothAction = ACTIONS.UPDATE;
        toolContext.vendorBoothEl = $(this).closest(".vendorBooth");
        toolContext.isTemp = false;
    })

    $(".destroy_vendorBooth").click(function() {
        var vendorBoothEl = $(this).closest(".vendorBooth");
        toolContext.vendorId = extractVendorId(vendorBoothEl[0]);

        deleteVendorBoothToHistory(vendorBoothEl, false);
        deleteVendorBoothInDom(vendorBoothEl);
        updateDragAssignEl();
    })

    $(".close_vendorBooth").click(function() {
        toolContext.vendorBooth.hide();
    })

////// Tag clicks

    $("#toggle_tags").click(function() {
        $("#tag_list").toggle();
        $(this).toggleClass("open");
    })

    $("#add_tag").click(function() {
        loadVendortagsIntoForm($("#tag_form"), false);
        $("#tag_form").parent().toggle();
        toolContext.tagAction = ACTIONS.CREATE;
    })

    $("#tag_form_submit").click(function() {
        var formEl = $(this).closest("form");
        if (validateTagFields(formEl)) {
            if (toolContext.tagAction === ACTIONS.CREATE) {
                addTagToDom();
                addTagToHistory();

                // Add to our tag dict so vendor form has access later
                addToTagDict("t" + lastTagId, $("input[name='tag_name']").val());

                toolContext.checkedAfter = checkedIntoSet("t" + lastTagId, $("#tag_form ul.assign_vendortags"), false);
                addVendorTagsToHistory();
                addVendorTagsToDom();
            } else if (toolContext.tagAction === ACTIONS.UPDATE) {
                updateTagInDom();
                updateTagToHistory();

                toolContext.checkedAfter = checkedIntoSet(toolContext.tagEl.data("id"), $("#tag_form ul.assign_vendortags"), false);
                updateVendorTagsToHistory();
                updateVendorTagsToDom();
            }
            $(this).closest("div.overlay").hide();
            resetForm(formEl);
        } else { // Error
            formEl.children("div.error").slideDown(300);
        }
        return false;
    })

    $(".update_tag").click(function() {
        toolContext.tagAction = ACTIONS.UPDATE;
        toolContext.isTemp = false;
        toolContext.tagEl = $(this).closest(".tag");

        prepTagForm(toolContext.tagEl, $("#tag_form"));
        loadVendortagsIntoForm($("#tag_form"), false, toolContext.tagEl);
        $("#tag_form").parent().toggle();
    })

    $(".destroy_tag").click(function() {
        var tagEl = $(this).closest(".tag");
        deleteTagToHistory(tagEl, false);
        deleteTagInDom(tagEl);
    })

    $(".tag_name").click(function() {
        $(this).parent().siblings(".tagshow_extra").toggle()
    })



    // ------------------------------------------------------------
////// MOUSEDOWN
    // ------------------------------------------------------------

    workArea.mousedown(function(e) {
        switch(selectedTool) {
            case TOOLS.RECTANGLE:
                startBooth(e);
                e.preventDefault(); // Stop :focus event from highlighting stuff confusingly
                break;
            default:
        }
    })

    $(".booth").mousedown(function(e) {
        switch(selectedTool) {
            case TOOLS.ERASER:
                deleteBoothToHistory($(this), false);
                deleteVendorBoothFromBooth($(this));
                $(this).addClass("deleted");
                break;
            case TOOLS.SELECT:
                startMoveBooth($(this), e);
                break;
            case TOOLS.INFOSELECT: // Only want one vendorbooth info show at a time
                if (toolContext.vendorBooth) { toolContext.vendorBooth.hide(); }
                toolContext.vendorBooth = $(this).children(".vendorBooth");
                toolContext.vendorBooth.show();
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
        e.preventDefault();  
        e.stopPropagation();
    })

    $(".booth").on("dragleave", function(e) {
        e.preventDefault();  
        e.stopPropagation();
    })

    $(".booth").on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    })

    $(".booth").on("drop", function(e, ui) {
        e.preventDefault();  
        e.stopPropagation();

        var vendorBooth_formEl = $("#vendorbooth_form");
        resetForm(vendorBooth_formEl);
        prepVendorBoothForm(vendorBooth_formEl);
        showVendorBoothForm(vendorBooth_formEl);

        toolContext.vendorBoothAction = ACTIONS.CREATE;
        toolContext.boothId = $(this).data("id");
        toolContext.boothEl = $(this);
    })

    // ------------------------------------------------------------
////// KEYPRESS EVENTS
    // ------------------------------------------------------------

    var KEYCODES = {CTRL : 17, V : 86, C : 67};
    var KEYSTATUS = { CTRL : false, V : false, C : false };

    function senseKeyDown(e, domEl) {
        if (e.keyCode === KEYCODES.CTRL) {
            KEYSTATUS.CTRL = true;
        }
        if (KEYSTATUS.CTRL && e.keyCode === KEYCODES.C) { // CTRL + C
            switch(selectedTool) {
                case TOOLS.SELECT:
                copyBooth(domEl);
                break;
            }
        }
        if (KEYSTATUS.CTRL && e.keyCode === KEYCODES.V) { // CTRL + V
            switch(selectedTool) {
                case TOOLS.SELECT:
                    pasteBooth();
                    break;
            }
        }
    }
    function senseKeyUp(e) {
        if (e.keyCode === KEYCODES.CTRL) {
            KEYSTATUS.CTRL = false;
        }
    }

    $(".booth").keydown(function(e) {
        senseKeyDown(e, $(this));
    })
    $(".booth").keyup(function(e) {
        senseKeyUp(e);
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
                    deleteVendorBoothFromBooth(boothEl);
                    boothEl.addClass("deleted");
                    break;
                case TOOLS.SELECT:
                    startMoveBooth(boothEl, e);
                    break;
                case TOOLS.INFOSELECT:
                    if (toolContext.vendorBooth) { toolContext.vendorBooth.hide(); }
                    toolContext.vendorBooth = boothEl.children(".vendorBooth");
                    toolContext.vendorBooth.show();
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

        boothEl.on("dragenter", function(e) {
            e.preventDefault();  
            e.stopPropagation();
        })

        boothEl.on("dragleave", function(e) {
            e.preventDefault();  
            e.stopPropagation();
        })

        boothEl.on("dragover", function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        })

        boothEl.on("drop", function(e, ui) {
            e.preventDefault();  
            e.stopPropagation();
            var vendorBooth_formEl = $("#vendorbooth_form");
            resetForm(vendorBooth_formEl);
            prepVendorBoothForm(vendorBooth_formEl);
            showVendorBoothForm(vendorBooth_formEl);

            toolContext.vendorBoothAction = ACTIONS.CREATE;
            toolContext.boothId = boothEl.data("id");
            toolContext.boothEl = boothEl;
        })

        boothEl.find(".close_vendorBooth").click(function() {
            $(this).closest("ul").hide()
        })

        boothEl.keydown(function(e) {
            senseKeyDown(e, boothEl);
        })
        boothEl.keyup(function(e) {
            senseKeyUp(e);
        })
    }

    function makeBoothEl(left, top, id, width, height) {
        width = width === undefined ? 0 : width;
        height = height === undefined ? 0 : height;
        return $("<div class=\"booth\" style=\"left:"+left+"px; top:"+top+"px; width:"+width+"px; height:"+height+"px;\""+
                 "data-id=\"t"+id+"\" tabindex=1>" + 
                    "<ul class=\"unordered vendorBooth\">" + 
                        "<li>Vendors assigned to this booth<a href=\"javascript:;\" class=\"close_vendorBooth\">" + 
                            "<i class=\"fa fa-times\"></i></a>"+
                        "</li>" + 
                        "<li class=\"no_vendorBooths\">No vendors assigned</li>"+
                    "</ul>" +
                "</div>");
    }

    function startBooth(e) {
        var offset = workArea.offset();
        toolContext.downX = e.pageX - offset.left;
        toolContext.downY = e.pageY - offset.top;
        lastBoothId++;

        toolContext.newBooth = makeBoothEl(toolContext.downX, toolContext.downY, lastBoothId);
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
        if (boothBigEnough()) {
            addBoothToHistory(toolContext.newBooth);
            addBoothListeners(toolContext.newBooth);
        }
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
        workArea.off("mousemove"); // Stop listening for mouse move\
        updateBoothToHistory(boothEl, isTemp);
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

    // Stores a booth in preparation for possible pasting
    function copyBooth(boothEl) {
        toolContext.clipboard = boothEl;
    }

    function pasteBooth() {
        if (toolContext.clipboard !== undefined) {
            lastBoothId++;
            var left = parseInt(toolContext.clipboard.css("left"));
            var top = parseInt(toolContext.clipboard.css("top"));
            var width = parseInt(toolContext.clipboard.css("width"));
            var height = parseInt(toolContext.clipboard.css("height"));

            var clone = makeBoothEl(left + 10, top + 10, lastBoothId, width, height);
            
            addBoothListeners(clone);
            $("#workArea").append(clone);
            addBoothToHistory(clone);
        }
    }

    // Don't create booths if they are below a certain point
    function boothBigEnough() {
        var width = parseInt(toolContext.newBooth.css("width"));
        var height = parseInt(toolContext.newBooth.css("height"));
        if (width < 25 && height < 25) {
            toolContext.newBooth.remove();
            return false;
        }
        return true;
    }


    // ------------------------------------------------------------
////// VENDOR
    // ------------------------------------------------------------

    // Attaches all required event listeners a vendor element
    function addVendorListeners(vendorEl) {
        vendorEl.find("a.vendor_name").click(function() { // Clicking vendor name toggles its vendorshow_extra info
            vendorEl.children(".vendorshow_extra").toggle();
        })

        vendorEl.find(".update_vendor").click(function() {
            toolContext.vendorEl = vendorEl;
            toolContext.vendorAction = ACTIONS.UPDATE;
            toolContext.isTemp = true;
            toolContext.vendorId = vendorEl.data("id");

            prepVendorForm(toolContext.vendorEl, $("#vendor_form"));
            loadVendortagsIntoForm($("#vendor_form"), true, toolContext.vendorEl);
            $("#vendor_form").parent().toggle();
        })

        vendorEl.find(".destroy_vendor").click(function() {
            deleteVendorToHistory(vendorEl, true);
            deleteVendorInDom(vendorEl);
        })

        vendorEl.find(".drag_assign").on("dragstart", function(e) {
            toolContext.vendorId = vendorEl.data("id");
        })

        vendorEl.find(".vendorview_toggle").click(function() {
            toggleVendorFilter($(this));
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
        // Remove tooltip that appears if theres no vendors
        $("#vendor_list li.no_models").remove();

        lastVendorId++;
        var name = $("input[name='vendor_name']").val();
        var url = $("input[name='vendor_url']").val();
        var desc = $("textarea[name='vendor_desc']").val();

        var newVendorEl = $("<li data-id=\"t"+ lastVendorId + "\">" +
                            "<div class=\"vendorshow\">" + 
                                "<i class=\"fa fa-circle-o drag_assign\" draggable=\"true\"></i> " +
                                "<a href=\"javascript:;\" class=\"vendor_name\">"+ name + "</a>" +
                                "<i class=\"fa fa-eye-slash vendorview_toggle\"></i>" +
                            "</div>" +
                            "<div class=\"vendorshow_extra\">" + 
                                "<div class=\"vendor_options\">" +
                                    "<button class=\"update_vendor greenbtn\"><i class=\"fa fa-pencil\"></i> Update</button> " +
                                    "<button class=\"destroy_vendor redbtn\"><i class=\"fa fa-trash\"></i> Destroy</button>" +
                                "</div>" + 
                                "<strong>URL: </strong><span class=\"vendor_url\">" + url + "</span>" + 
                                "<strong>Description: </strong><span class=\"vendor_desc\">" + desc + "</span>" + 
                                "<strong>Tags: </strong><ul class=\"vendor_tags\"></ul>" + 
                            "</div>" + 
                            "</li>");
        addVendorListeners(newVendorEl);
        $("#vendor_list ul.unordered").append(newVendorEl);
        return newVendorEl;
    }

    // Log creating a vendor into our history array
    function addVendorToHistory() {
        var name = $("input[name='vendor_name']").val();
        var url = $("input[name='vendor_url']").val();
        var desc = $("textarea[name='vendor_desc']").val();
        var vendorHistory = {
            "action" : ACTIONS.CREATE,
            "type" : TYPES.VENDOR,
            "id" : "t" + lastVendorId,
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

        updateVendorTagNamesInDom(name, toolContext.vendorId, true);
    }

    // Log updating a vendor into our history array
    function updateVendorToHistory() {
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
        if (toolContext.isTemp) { // Updated temp obj never saved. 
            vendorHistory["isTemp"] = true;
        }
        actionHistory.push(vendorHistory);
    }

    function deleteVendorInDom(vendorEl) {
        var toggleEl = vendorEl.find(".vendorview_toggle");
        if (toggleEl.hasClass("vendorview_on")) { // If highlighting currently, turn off
            toggleVendorFilter(toggleEl);
        }
        var vendorId = vendorEl.data("id");
        vendorEl.addClass("deleted");
        $(".vendorBooth .v"+vendorId).addClass("deleted");

        deleteVendorTagsInDom(vendorId, true);
    }

    function deleteVendorToHistory(vendorEl, isTemp) {
        var vendorHistory = {
            "action" : ACTIONS.DELETE,
            "type" : TYPES.VENDOR,
            "id" : vendorEl.data("id")
        }
        if (isTemp) { // Deleted temp obj never saved. Keep track of this
            vendorHistory["isTemp"] = true;
        }
        actionHistory.push(vendorHistory);
    }

    // TODO !!! Bug -> If one booth has multiple vendors, then toggling one might turn
    // off highlighting for something that should have it on
    // Idea: use toolContext, store all highlighted vendor id classes
    function toggleVendorFilter(toggleEl) {
        var vendorClass = "v" + toggleEl.closest("li").data("id");
        if (toggleEl.hasClass("vendorview_on")) { // ON to OFF
            toggleEl.removeClass("vendorview_on");
            toggleEl.removeClass("fa-eye");
            toggleEl.addClass("fa-eye-slash");
            $(".booth."+vendorClass).removeClass("highlight");
        } else { // OFF to ON
            toggleEl.addClass("vendorview_on");
            toggleEl.addClass("fa-eye");
            toggleEl.removeClass("fa-eye-slash");
            $(".booth."+vendorClass).addClass("highlight");
        }
    }

    // Checks for booths with a vendor and replaces the drag image if there are any atm
    function updateDragAssignEl() {
        var vendorId = toolContext.vendorId;
        var vendorEl = $("#vendor_list li[data-id="+vendorId+"]");
        var dragEl = vendorEl.find(".drag_assign");
        if ($("li.vendorBooth.v"+vendorId).not(".deleted").length > 0) {
            dragEl.addClass("fa-circle");
            dragEl.removeClass("fa-circle-o");
        } else {
            dragEl.addClass("fa-circle-o");
            dragEl.removeClass("fa-circle");
        }
    }



    // ------------------------------------------------------------
////// VENDOR BOOTH
    // ------------------------------------------------------------

    function addVendorBoothListeners(vendorBoothEl) {
        vendorBoothEl.find(".update_vendorBooth").click(function() {
            var vendorBooth_formEl = $("#vendorbooth_form");

            resetForm(vendorBooth_formEl);
            prepVendorBoothForm(vendorBooth_formEl, vendorBoothEl);
            showVendorBoothForm(vendorBooth_formEl);

            toolContext.vendorBoothAction = ACTIONS.UPDATE;
            toolContext.vendorBoothEl = vendorBoothEl;
            toolContext.isTemp = true;
        })
        vendorBoothEl.find(".destroy_vendorBooth").click(function() {
            toolContext.vendorId = extractVendorId(vendorBoothEl[0]);

            deleteVendorBoothToHistory(vendorBoothEl, true);
            deleteVendorBoothInDom(vendorBoothEl);
            updateDragAssignEl();
        })
    }

    function addVendorBoothToDom() {
        lastVendorBoothId++;
        var startDate = new Date($("input[name='vendorbooth_starttime']").val());
        var endDate = new Date($("input[name='vendorbooth_endtime']").val());
        var range = "(" + formatDate(startDate) + " - " + formatDate(endDate) + ")";
        var vendorName = $("#vendor_list").find("li[data-id="+toolContext.vendorId+"]").children(".vendorshow").children(".vendor_name").text()
        var vendorBoothEl= toolContext.boothEl.children(".vendorBooth");
        vendorBoothEl.children(".no_vendorBooths").hide();
        var newVendorBoothEl = $("<li class=\"vendorBooth v"+toolContext.vendorId+"\" data-id=\"t"+lastVendorBoothId+"\">" +
                             vendorName +
                            "<div class=\"options\">" +
                                "<a href=\"javascript:;\" class=\"update_vendorBooth\"><i class=\"fa fa-pencil\"></i></a>" + 
                                "<a href=\"javascript:;\" class=\"destroy_vendorBooth\"><i class=\"fa fa-trash\"></i></a>" +
                            "</div>" + 
                            "<span class=\"dateRange\">" + range + "</span>" +
                            "</li>");
        vendorBoothEl.append(newVendorBoothEl);
        addVendorBoothListeners(newVendorBoothEl);

        // Update the booth too for highlighting
        toolContext.boothEl.addClass("v"+toolContext.vendorId);
        // If the vendor is currently being highlighted, we need to add highlights
        if ($("li[data-id=\"t"+toolContext.vendorId + "\"").find(".vendorview_on").length > 0) {
            toolContext.boothEl.addClass("highlight");
        }
    }

    function addVendorBoothToHistory() {
        var start = $("input[name='vendorbooth_starttime']").val();
        var end = $("input[name='vendorbooth_endtime']").val();
        var vendorBoothHistory = {
            "action" : ACTIONS.CREATE,
            "type" : TYPES.VENDOR_BOOTH,
            "vendor_id" : toolContext.vendorId,
            "booth_id" : toolContext.boothId,
            "start_time" : start,
            "end_time": end,
            "id" : "t" + lastVendorBoothId,
            "isTemp" : true
        }
        actionHistory.push(vendorBoothHistory);
    }

    function updateVendorBoothInDom() { // toolContext.vendorBoothEl
        var startDate = new Date($("input[name='vendorbooth_starttime']").val());
        var endDate = new Date($("input[name='vendorbooth_endtime']").val());
        var range = "(" + formatDate(startDate) + " - " + formatDate(endDate) + ")";
        toolContext.vendorBoothEl.children(".dateRange").text(range);
    }

    function updateVendorBoothToHistory() { // toolContext.vendorBoothEl
        var start = $("input[name='vendorbooth_starttime']").val();
        var end = $("input[name='vendorbooth_endtime']").val();
        var vendorBoothHistory = {
            "action" : ACTIONS.UPDATE,
            "type" : TYPES.VENDOR_BOOTH,
            "vendor_id" : extractVendorId(toolContext.vendorBoothEl[0]),
            "booth_id" : toolContext.vendorBoothEl.closest(".booth").data("id"),
            "start_time" : start,
            "end_time": end,
            "id" : toolContext.vendorBoothEl.data("id")
        }
        if (toolContext.isTemp) { // Updated temp obj vendor booth that was never saved
            vendorBoothHistory["isTemp"] = true;
        }
        actionHistory.push(vendorBoothHistory);
    }

    function deleteVendorBoothInDom(vendorBoothEl) {
        vendorBoothEl.addClass("deleted");
        vendorBoothEl.closest(".booth").removeClass("v"+toolContext.vendorId);
    }

    function deleteVendorBoothToHistory(vendorBoothEl, isTemp) {
        var vendorBoothHistory = {
            "action" : ACTIONS.DELETE,
            "type" : TYPES.VENDOR_BOOTH,
            "id" : vendorBoothEl.data("id")
        }
        if (isTemp) {
            vendorBoothHistory["isTemp"] = true;
        }
        actionHistory.push(vendorBoothHistory);
    }

    // TODO!!
    function validateVendorBoothFields(formEl) {
        return true;
    }

    // When a booth is deleted, its associated vendor booths should be 'deleted' in the DOM
    // We then call similar functions that also call on deletion from button press of vendorbooth
    function deleteVendorBoothFromBooth(boothEl) {
        var vendorBooths = boothEl.find("li.vendorBooth").addClass("deleted");
        for (var i = 0; i < vendorBooths.length; i++) {
            var vendorBoothEl = vendorBooths[i];
            toolContext.vendorId = extractVendorId(vendorBoothEl);
            updateDragAssignEl();
            $(vendorBoothEl).addClass("deleted");
        }
    }



    // ------------------------------------------------------------
////// TAG
    // ------------------------------------------------------------

    function addTagListeners(tagEl) {
        tagEl.find(".update_tag").click(function() {
            toolContext.tagAction = ACTIONS.UPDATE;
            toolContext.isTemp = true;
            toolContext.tagEl = tagEl;

            prepTagForm(tagEl, $("#tag_form"));
            loadVendortagsIntoForm($("#tag_form"), false, tagEl);
            $("#tag_form").parent().toggle();
        })
        tagEl.find(".destroy_tag").click(function() {
            deleteTagToHistory(tagEl, true);
            deleteTagInDom(tagEl);
        })
        tagEl.find(".tag_name").click(function() {
            tagEl.children(".tagshow_extra").toggle();
        })
    }

    function addTagToDom() {
        // Hide the tip that appears by default
        $("#tag_list li.no_models").remove();

        lastTagId++;
        var name = $("input[name='tag_name']").val();

        var newTagEl = $("<li data-id=\"t"+lastTagId+"\" class=\"tag\">" +
                            "<div class=\"tagshow\">" +
                                "<a href=\"javascript:;\" class=\"tag_name\">"+ name + "</a>" +
                                "<div class=\"tag_options\">" +
                                    "<a href=\"javascript:;\" class=\"update_tag\"><i class=\"fa fa-pencil\"></i></a> " +
                                    "<a href=\"javascript:;\" class=\"destroy_tag\"><i class=\"fa fa-trash\"></i></a>" +
                                "</div>" +
                            "</div>" +
                            "<ul class=\"tagshow_extra\"></ul>" +
                            "</li>");
        $("#tag_list ul").first().append(newTagEl);
        addTagListeners(newTagEl);
        return newTagEl;
    }

    function addTagToHistory() {
        var name = $("input[name='tag_name']").val();
        var tagHistory = {
            "action" : ACTIONS.CREATE,
            "type": TYPES.TAG,
            "id" : "t" + lastTagId,
            "name" : name,
            "isTemp" : true
        }
        actionHistory.push(tagHistory);
    }

    function updateTagInDom() {
        var name = $("input[name='tag_name']").val();
        toolContext.tagEl.find(".tag_name").text(name);

        updateVendorTagNamesInDom(name, toolContext.tagEl.data("id"), false);
    }

    function updateTagToHistory() {
        var name = $("input[name='tag_name']").val();
        var tagHistory = {
            "action" : ACTIONS.UPDATE,
            "type" : TYPES.TAG,
            "id" : toolContext.tagEl.data("id"),
            "name" : name
        }
        if (toolContext.isTemp) { // Updated temp obj never saved
            tagHistory["isTemp"] = true;
        }
        actionHistory.push(tagHistory);
    }

    function deleteTagToHistory(tagEl, isTemp) {
        var tagHistory = {
            "action" : ACTIONS.DELETE,
            "type": TYPES.TAG,
            "id" : tagEl.data("id")
        }
        if (isTemp) { // Deleted temp obj never saved
            tagHistory["isTemp"] = true;
        }
        actionHistory.push(tagHistory);
    }

    function deleteTagInDom(tagEl) {
        tagEl.addClass("deleted");

        deleteVendorTagsInDom(tagEl.data("id"), false);
    }

    // TODO!!
    function validateTagFields(formEl) {
        if ($("input[name='tag_name']").val().length < 1) {
            return false;
        }
        return true;
    }



    // ------------------------------------------------------------
////// VENDOR TAG
    // ------------------------------------------------------------


    function addOneVendorTagToDom(vendorTagId) {
        var tagId = getTagIdFromVendorTag(vendorTagId);
        var vendorId = getVendorIdFromVendorTag(vendorTagId);
        var tagName = $("#tag_list li[data-id="+tagId+"] .tag_name").text();
        var vendorName = $("#vendor_list li[data-id="+vendorId+"] .vendor_name").text();

        // Update tag listing
        $("#tag_list li[data-id="+tagId+"] .tagshow_extra").append("<li class=\"vendorTag\" data-id=\""+vendorId+"\">"+vendorName+"</li>");

        // Update vendor listing
        $("#vendor_list li[data-id="+vendorId+"] .vendorshow_extra .vendor_tags").append("<li class=\"vendorTag\" data-id=\""+tagId+"\">"+tagName+"</li>");
    }

    function destroyOneVendorTagInDom(vendorTagId) {
        var tagId = getTagIdFromVendorTag(vendorTagId);
        var vendorId = getVendorIdFromVendorTag(vendorTagId);
        var tagName = $("#tag_list li[data-id="+tagId+"] .tag_name").text();
        var vendorName = $("#vendor_list li[data-id="+vendorId+"] .vendor_name").text();

        // Update tag listing
        $("#tag_list li[data-id="+tagId+"] .vendorTag[data-id="+vendorId+"]").remove();

        // Update vendor listing
        $("#vendor_list li[data-id="+vendorId+"] .vendorTag[data-id="+tagId+"]").remove();
    }

    // Given a set of "vendor-1_tag-1" like strings, adds vendor tags to associated
    // vendors, tags in the DOM
    function addVendorTagsToDom() {
        var vendorName; var vendorId; var tagName; var tagId;
        toolContext.checkedAfter.forEach(function(vendorTagId) {
            addOneVendorTagToDom(vendorTagId);
        })
    }

    // For the new tag or new vendor form, so all are create
    // We pass in array of vendor tags to create
    function addVendorTagsToHistory() {
        var vendorTagHistory = {
            "type" : TYPES.VENDOR_TAG,
            "create" : Array.from(toolContext.checkedAfter),
            "destroy" : []
        }
        actionHistory.push(vendorTagHistory);
    }

    // With the vendor tags that were tagged before (toolContext.checkedBefore), logs BOTH new
    // creates and destroys depending on what is checked afterwards
    function updateVendorTagsToHistory() {
        toolContext.checkedBefore;
        toolContext.createDestroyMap = getCreatesAndDeletes(toolContext.checkedBefore, toolContext.checkedAfter);
        var vendorTagHistory = {
            "type" : TYPES.VENDOR_TAG,
            "create" : toolContext.createDestroyMap["create"],
            "destroy" : toolContext.createDestroyMap["destroy"]
        }
        actionHistory.push(vendorTagHistory);
    }

    // Given a map with create and destroy actions, updates and removes vendor tags in
    // the DOM as necessary
    function updateVendorTagsToDom() {
        // CREATE NEW TAGS
        for (var i = 0; i < toolContext.createDestroyMap["create"].length; i++) {
            addOneVendorTagToDom(toolContext.createDestroyMap["create"][i]);
        }
        for (var i = 0; i < toolContext.createDestroyMap["destroy"].length; i++) {
            destroyOneVendorTagInDom(toolContext.createDestroyMap["destroy"][i]);
        }
    }

    // If a tag or vendor update changes the name, we'll have to update the vendortags
    // associated as a result
    function updateVendorTagNamesInDom(newName, id, isVendor) {
        if (isVendor) { // Vendor name update
            $("#tag_list .vendorTag[data-id="+id+"]").text(newName);
            vendorDict[id] = newName;
        } else { // Tag name update
            $("#vendor_list .vendorTag[data-id="+id+"]").text(newName);
            tagDict[id] = newName;
        }
    }

    // If a tag or vendor is deleted, we need to delete the vendor tag as well and update
    // the dict to prevent
    function deleteVendorTagsInDom(id, isVendor) {
        if (isVendor) { // Vendor was destroyed
            delete vendorDict[id];
            $("#tag_list .vendorTag[data-id="+id+"]").addClass("deleted");
        } else { // Tag was destroyed
            delete tagDict[id];
            $("#vendor_list .vendorTag[data-id="+id+"]").addClass("deleted");
        }

    }





    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
////// HELPERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // Given two sets of x, y that define the zone of a rectangle
    // returns topleft coords as [x,y] 
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

        formEl.find("input[name='vendor_name']").val(name);
        formEl.find("input[name='vendor_url']").val(url);
        formEl.find("textarea[name='vendor_desc']").val(desc);
    }

    // Given the vendorbooth form element, gets a top left corner and edits the vendorBooth form DOM object
    function prepVendorBoothForm(vendorbooth_formEl, vendorBoothEl) {
        var x = event.pageX;
        var y = event.pageY;
        vendorbooth_formEl.css("top", y);
        vendorbooth_formEl.css("left", x);
        if (vendorBoothEl !== undefined) { // UPDATE - Load in whatever was before
            var startDate = vendorBoothEl.children(".dateRange").text().split("-")[0];
            startDate = expandDate(startDate.substring(1, startDate.length-1));
            var endDate = vendorBoothEl.children(".dateRange").text().split("-")[1];
            endDate = expandDate(endDate.substring(1, endDate.length-1));

            vendorbooth_formEl.find("input[name='vendorbooth_starttime']").val(startDate);
            vendorbooth_formEl.find("input[name='vendorbooth_endtime']").val(endDate);
        }
    }

    function showVendorBoothForm(vendorbooth_formEl) {
        vendorbooth_formEl.parent().show();
    }

    // Preps tag form with data from a tag El
    function prepTagForm(tagEl, formEl) {
        var name = tagEl.find(".tag_name").text();
        formEl.find("input[name='tag_name']").val(name);
    }

    // Reload the vendortag listings into either the tag or vendor form
    // id = the vendor or tag id to apply to. If new object, -1
    function loadVendortagsIntoForm(formEl, isVendorForm, modelEl) {
        var assignEl = formEl.find(".assign_vendortags");
        assignEl.empty();
        if (modelEl === undefined) { // NEW forms, nothing checked before
            var id = -1;
            toolContext.checkedBefore = new Set();
            if (isVendorForm) { // Making new vendor
                for (var key in tagDict) {
                    assignEl.append("<li><input type=\"checkbox\" data-tid="+key+" data-vid="+id+">"+tagDict[key]+"</li>");
                }
            } else { // Making new tag
                for (var key in vendorDict) {
                    assignEl.append("<li><input type=\"checkbox\"data-tid="+id+" data-vid="+key+">"+vendorDict[key]+"</li>");
                }
            }
        } else { // UPDATE forms
            var id = modelEl.data("id");
            if (isVendorForm) { // Updating vendor
                toolContext.checkedBefore = checkedIntoSet(id, modelEl.find(".vendor_tags"), true);
                for (var key in tagDict) {
                    var checkbox = $("<li><input type=\"checkbox\" data-tid="+key+" data-vid="+id+">"+tagDict[key]+"</li>");
                    if (toolContext.checkedBefore.has("vendor-" + id + "_tag-" + key)) {
                        checkbox.children("input").prop("checked", true);
                    }
                    assignEl.append(checkbox);
                }
            } else { // Updating tag
                toolContext.checkedBefore = checkedIntoSet(id, modelEl.children(".tagshow_extra"), false);
                for (var key in vendorDict) {
                    var checkbox = $("<li><input type=\"checkbox\"data-tid="+id+" data-vid="+key+">"+vendorDict[key]+"</li>");
                    if (toolContext.checkedBefore.has("vendor-" + key + "_tag-" + id)) {
                        checkbox.children("input").prop("checked", true);
                    }
                    assignEl.append(checkbox);
                }
            }
        }
    }

    function numToDayOfWeek(num) { // Given a number between 0 - 6, converts to string that is day of week
        switch(num) {
            case 0:
                return "Sun";
            case 1:
                return "Mon";
            case 2:
                return "Tue";
            case 3:
                return "Wed";
            case 4:
                return "Thu";
            case 5:
                return "Fri";
            case 6:
                return "Sat";
            default:
                return "N/A";
        }
    }

    function removeBlanks(arr) {
        var i = 0;
        while (i < arr.length) {
            if (arr[i].length === 0) {
                arr.splice(i, 1);
            } else {
                i++;
            }
        }
        return arr;
    }

    // Given a JS date object, formats into shortened form like "10/21 Fri 2:00 pm"
    function formatDate(date) {
        var month = date.getMonth() + 1; // JS date starts at 0 so add 1
        var dateDay = date.getDate();
        var day = numToDayOfWeek(date.getDay()); // e.g. "Mon"
        var hour = date.getHours() % 13;
        var period = date.getHours() > 11 ? "pm" : "am";
        var min = date.getMinutes();
        min = min < 10 ? "0" + min : min;
        return month + "/" + dateDay + " " + day + " " + hour + ":" + min + " " + period;
    }

    // Given the shorted date form, reexpands to form like "2015/10/09 02:00"
    function expandDate(datestring) {
        var datePieces = removeBlanks(datestring.split(" "));
        var month = datePieces[0].split("/")[0];
        var day = Number(datePieces[0].split("/")[1]);
        if (day < 10) {
            day = "0" + day;
        }
        var period = datePieces[2].substring(datePieces[2].length - 2);
        var hour = Number(datePieces[2].split(":")[0]) - 1; // jQuery dateTime picker starts at 0
        if (period === "pm") {
            hour = hour + 12;
        }
        if (hour < 10) {
            hour = "0" + hour;
        }
        var minute = datePieces[2].split(":")[1].substring(0,2);
        var year = new Date().getFullYear();
        return year + "/" + month + "/" + day + " " + hour + ":" + minute;

    }

    // Given a DOM element, extracts the vendor ID through the class ("v19" -> vendor ID = 19)
    function extractVendorId(domEl) {
        var re = /^v\d+$/; // REGEX for v11111+
        var classes = domEl.classList;
        for (var i = 0; i < classes.length; i++) {
            if (re.test(classes[i])) { // Matches vendor class with ID pattern
                return parseInt(classes[i].substring(1)) // Return just ID number
            }
        }
    }

    // Initializes the vendor dict with id and name values
    function loadVendorDict(initialVendors) {
        for (var i = 0; i < initialVendors.length; i++) {
            var vendorObj = initialVendors[i];
            vendorDict[vendorObj["id"]] = vendorObj["name"];
        }
    }

    // Initializes the tag dict with id and name values
    function loadTagDict(initialTags) {
         for (var i = 0; i < initialTags.length; i++) {
            var tagObj = initialTags[i];
            tagDict[tagObj["id"]] = tagObj["name"];
        }
    }

    function addToVendorDict(id, name) {
        vendorDict[id] = name;
    }

    function addToTagDict(id, name) {
        tagDict[id] = name;
    }

    // Given a ul element with li elements, creates set with "vendor-1_tag-1" where num = ID or temp ID
    function checkedIntoSet(id, ulEl, isVendor) {
        var idSet = new Set();
        if (ulEl.hasClass("assign_vendortags")) { // ulEl is from the FORM - likely checking aftermath of form
            if (isVendor) { // VENDOR FORM
                var checkedEls = $("#vendor_form .assign_vendortags").find("input:checked");
                for (var i = 0; i < checkedEls.size(); i++) {
                    idSet.add("vendor-" + id + "_tag-" + $(checkedEls[i]).data("tid"));
                }
            } else { // TAG FORM
                var checkedEls = $("#tag_form .assign_vendortags").find("input:checked");
                for (var i = 0; i < checkedEls.size(); i++) {
                    idSet.add("vendor-" + $(checkedEls[i]).data("vid") + "_tag-" + id);
                }
            }
        } else { // ulEl is from the dom display - likely populating form
            if (isVendor) { // Populate - VENDOR FORM
                var liElements = ulEl.children();
                for (var i = 0; i < liElements.size(); i++) {
                    idSet.add("vendor-" + id + "_tag-" + $(liElements[i]).data("id"));
                }
            } else { // Populate - TAG FORM
                var liElements = ulEl.children();
                for (var i = 0; i < liElements.size(); i++) {
                    idSet.add("vendor-" + $(liElements[i]).data("id") + "_tag-" + id);
                }
            }
        }
        return idSet;
    }

    // Given two sets representing checkboxes before and checkboxes after, organizes
    // changes into CREATES and DESTROYS. Used for vendortag
    function getCreatesAndDeletes(beforeSet, afterSet) {
        var actions = { "destroy" : [] };
        beforeSet.forEach(function(value) {
            if (!afterSet.has(value)) { // Was checked, now not. DESTROY
                actions["destroy"].push(value);
            } else { // Overlap
                afterSet.delete(value);
            }
        })
        // Whatever's left (not overlap) in after is create
        actions["create"] = Array.from(afterSet);
        return actions;
    }

    function getVendorIdFromVendorTag(vendorTagId) {
        return vendorTagId.split("_")[0].substring(7);
    }

    function getTagIdFromVendorTag(vendorTagId) {
        return vendorTagId.split("_")[1].substring(4);
    }

    // Saving craft tip functions 
    function showSaving() {
        $("#saveSuccess").hide()
        $("#saveError").hide();

        $("#saving").parent().show();
        $("#currentlySaving").show();
        $("#saving").slideDown(200);
    }
    function hideSaving() {
        $("#saving").slideUp(200, function () {
            $("#saving").parent().hide();
        });
    }
    function saveSuccessful() {
        $("#currentlySaving").hide();
        $("#saveSuccess").show();
    }
    function saveError() {
        $("#currentlySaving").hide();
        $("#saveError").show();
    }

}











