
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










}











