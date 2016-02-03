
// Vendor booth listeners, event handlers, functions for MapMaker
// Accessing  => MapMaker.vendorBooth.<functionName>

MapMaker.vendorBooth = {};

MapMaker.vendorBooth.addToHistory = function() {
    var start = $("input[name='vendorbooth_starttime']").val();
    var end = $("input[name='vendorbooth_endtime']").val();
    var vendorBoothHistory = {
        "action" : ACTIONS.CREATE,
        "type" : TYPES.VENDOR_BOOTH,
        "vendor_id" : toolContext.vendorId,
        "booth_id" : toolContext.boothId,
        "start_time" : start,
        "end_time": end,
        "id" : "t" + MapMaker.lastVendorBoothId,
        "isTemp" : true
    }
    actionHistory.push(vendorBoothHistory);
}

MapMaker.vendorBooth.deleteToHistory = function(vendorBoothEl, isTemp) {
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

MapMaker.vendorBooth.updateToHistory = function() { // Uses toolContext.vendorBoothEl
    var start = $("input[name='vendorbooth_starttime']").val();
    var end = $("input[name='vendorbooth_endtime']").val();
    var vendorBoothHistory = {
        "action" : ACTIONS.UPDATE,
        "type" : TYPES.VENDOR_BOOTH,
        "vendor_id" : MapMaker.extractVendorId(toolContext.vendorBoothEl[0]),
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

MapMaker.vendorBooth.makeEl = function(vendorId, vendorName, vendorBoothId, dateRange) {
    return $("<li class=\"vendorBooth v"+toolContext.vendorId+"\" data-id=\"t"+vendorBoothId+"\">" +
                     vendorName +
                    "<div class=\"options\">" +
                        "<a href=\"javascript:;\" class=\"update_vendorBooth\"><i class=\"fa fa-pencil\"></i></a>" + 
                        "<a href=\"javascript:;\" class=\"destroy_vendorBooth\"><i class=\"fa fa-trash\"></i></a>" +
                    "</div>" + 
                "<span class=\"dateRange\">" + dateRange + "</span>" +
            "</li>");
}

MapMaker.vendorBooth.addToDom = function() {
    MapMaker.lastVendorBoothId++;

    var startDate = new Date($("input[name='vendorbooth_starttime']").val());
    var endDate = new Date($("input[name='vendorbooth_endtime']").val());
    var range = "(" + MapMaker.formatDate(startDate) + " - " + MapMaker.formatDate(endDate) + ")";
    var vendorName = $("#vendor_list").find("li[data-id="+toolContext.vendorId+"]").children(".vendorshow").children(".vendor_name").text()
    
    // Hide the "no vendors assigned" tooltip since we're adding one
    var vendorBoothEl= toolContext.boothEl.children(".vendorBooth");
    vendorBoothEl.children(".no_vendorBooths").hide();

    var newVendorBoothEl = MapMaker.vendorBooth.makeEl(toolContext.vendorId, vendorName, MapMaker.lastVendorBoothId, range);

    vendorBoothEl.append(newVendorBoothEl);
    MapMaker.vendorBooth.addListeners(newVendorBoothEl, true);

    // Update the booth too for highlighting
    toolContext.boothEl.addClass("v"+toolContext.vendorId);

    // If the vendor is currently being highlighted, we need to add highlights
    if ($("li[data-id=\"t"+toolContext.vendorId + "\"").find(".vendorview_on").length > 0) {
        toolContext.boothEl.addClass("highlight");
    }
}

MapMaker.vendorBooth.deleteInDom = function(vendorBoothEl) {
    vendorBoothEl.addClass("deleted");
    vendorBoothEl.closest(".booth").removeClass("v"+toolContext.vendorId);
}

MapMaker.vendorBooth.updateInDom = function() { // Uses toolContext.vendorBoothEl
    var startDate = new Date($("input[name='vendorbooth_starttime']").val());
    var endDate = new Date($("input[name='vendorbooth_endtime']").val());
    var range = "(" + MapMaker.formatDate(startDate) + " - " + MapMaker.formatDate(endDate) + ")";
    toolContext.vendorBoothEl.children(".dateRange").text(range);
}

// When a booth is deleted, its associated vendor booths should be 'deleted' in the DOM
// We then call similar functions that also call on deletion from button press of vendorbooth
MapMaker.vendorBooth.deleteFromBooth = function(boothEl) {
    var vendorBooths = boothEl.find("li.vendorBooth").addClass("deleted");
    for (var i = 0; i < vendorBooths.length; i++) {
        var vendorBoothEl = vendorBooths[i];
        toolContext.vendorId = MapMaker.extractVendorId(vendorBoothEl);
        MapMaker.vendor.updateDragAssignEl();
        $(vendorBoothEl).addClass("deleted");
    }
}

// Given the vendorbooth form element, gets a top left corner and edits the vendorBooth form DOM object
MapMaker.vendorBooth.prepForm = function(vendorbooth_formEl, vendorBoothEl) {
    var x = event.pageX;
    var y = event.pageY;
    vendorbooth_formEl.css("top", y);
    vendorbooth_formEl.css("left", x);
    if (vendorBoothEl !== undefined) { // UPDATE - Load in whatever was before
        var startDate = vendorBoothEl.children(".dateRange").text().split("-")[0];
        startDate = MapMaker.expandDate(startDate.substring(1, startDate.length-1));
        var endDate = vendorBoothEl.children(".dateRange").text().split("-")[1];
        endDate = MapMaker.expandDate(endDate.substring(1, endDate.length-1));

        vendorbooth_formEl.find("input[name='vendorbooth_starttime']").val(startDate);
        vendorbooth_formEl.find("input[name='vendorbooth_endtime']").val(endDate);
    }
}

MapMaker.vendorBooth.showForm = function(vendorbooth_formEl) {
    vendorbooth_formEl.parent().show();
}

// TODO !!
MapMaker.vendorBooth.validate = function(formEl) {
    return true;
}

    // ------------------------------------------------------------
////// VENDOR BOOTH LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

MapMaker.vendorBooth.loadListeners = function() {
    MapMaker.vendorBooth.addListener_formSubmit();
    MapMaker.vendorBooth.addListener_closeClick();
    MapMaker.vendorBooth.addListeners($("li.vendorBooth"), false);
}

MapMaker.vendorBooth.addListeners = function(vendorBoothEl, isTemp) {
    MapMaker.vendorBooth.addListener_updateClick(vendorBoothEl, isTemp);
    MapMaker.vendorBooth.addListener_destroyClick(vendorBoothEl, isTemp);
}


MapMaker.vendorBooth.addListener_formSubmit = function() {
    $("#vendorbooth_form_submit").click(function() {
        var formEl = $(this).parent();
        if (MapMaker.vendorBooth.validate(formEl)) {
            if (toolContext.vendorBoothAction === ACTIONS.CREATE) {
                MapMaker.vendorBooth.addToDom();
                MapMaker.vendorBooth.addToHistory();
                
                MapMaker.vendor.updateDragAssignEl();
            } else if (toolContext.vendorBoothAction === ACTIONS.UPDATE) {
                MapMaker.vendorBooth.updateInDom();
                MapMaker.vendorBooth.updateToHistory();
            }
            $(this).closest("div.overlay").hide();
            MapMaker.resetForm(formEl);
        } else { // Error
            formEl.children("div.error").slideDown(300);
        }
        return false;
    })
}

MapMaker.vendorBooth.addListener_destroyClick = function(vendorBoothEl, isTemp) {
    vendorBoothEl.find(".destroy_vendorBooth").click(function() {
        var vendorBoothEl = $(this).closest(".vendorBooth");
        toolContext.vendorId = MapMaker.extractVendorId(vendorBoothEl[0]);

        MapMaker.vendorBooth.deleteToHistory(vendorBoothEl, isTemp);
        MapMaker.vendorBooth.deleteInDom(vendorBoothEl);
        MapMaker.vendor.updateDragAssignEl();
    })
}

// Given that the element passed in is the one that will take in the click
MapMaker.vendorBooth.addListener_updateClick = function(vendorBoothEl, isTemp) {
    vendorBoothEl.find(".update_vendorBooth").click(function() {
        var vendorBooth_formEl = $("#vendorbooth_form");
        var vendorboothEl = $(this).closest("li.vendorBooth");

        MapMaker.resetForm(vendorBooth_formEl);
        MapMaker.vendorBooth.prepForm(vendorBooth_formEl, vendorboothEl);
        MapMaker.vendorBooth.showForm(vendorBooth_formEl);

        toolContext.vendorBoothAction = ACTIONS.UPDATE;
        toolContext.vendorBoothEl = vendorBoothEl;
        toolContext.isTemp = isTemp;
    })
}

MapMaker.vendorBooth.addListener_closeClick = function() {
    $(".close_vendorBooth").click(function() {
        toolContext.vendorBooth.hide();
    })
}