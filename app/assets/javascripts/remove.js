
function mapMaker1(workArea, toolBar) {


    // ------------------------------------------------------------
////// CLICK
    // ------------------------------------------------------------


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

////// Vendor Booth clicks


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








}











