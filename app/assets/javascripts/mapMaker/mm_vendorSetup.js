
// Vendor listeners, event handlers, functions for MapMaker
// Accessing => MapMaker.vendor.<functionName>

MapMaker.vendor = {};

// Log creating a vendor into our history array
MapMaker.vendor.addToHistory = function() {
    var name = $("input[name='vendor_name']").val();
    var url = $("input[name='vendor_url']").val();
    var desc = $("textarea[name='vendor_desc']").val();
    var vendorHistory = {
        "action" : ACTIONS.CREATE,
        "type" : TYPES.VENDOR,
        "id" : "t" + MapMaker.lastVendorId,
        "name" : name,
        "website_url" : url,
        "description" : desc,
        "isTemp" : true
    }
    actionHistory.push(vendorHistory);
}

// Log deleting a vendor into our history array
MapMaker.vendor.deleteToHistory = function(vendorEl, isTemp) {
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

// Log updating a vendor into our history array
MapMaker.vendor.updateToHistory = function() {
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

// Given related fields, returns a vendor DOM element
MapMaker.vendor.makeEl = function(vendorId, name, url, desc) {
    var newVendorEl = $("<li data-id=\"t"+ MapMaker.lastVendorId + "\">" +
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
    return newVendorEl;
}

// Given a form, creates a vendor DOM element and attaches listeners
MapMaker.vendor.addToDom = function() {
    // Remove tooltip that appears if theres no vendors
    $("#vendor_list li.no_models").remove();

    MapMaker.lastVendorId++;
    var name = $("input[name='vendor_name']").val();
    var url = $("input[name='vendor_url']").val();
    var desc = $("textarea[name='vendor_desc']").val();

    var newVendorEl = MapMaker.vendor.makeEl(MapMaker.lastVendorId, name, url, desc);
    MapMaker.vendor.addListeners(newVendorEl, true);
    $("#vendor_list ul.unordered").append(newVendorEl);
}

// Given a vendor DOM element, removes it from the DOM tree
MapMaker.vendor.deleteInDom = function(vendorEl) {
    var toggleEl = vendorEl.find(".vendorview_toggle");
    if (toggleEl.hasClass("vendorview_on")) { // If highlighting currently, turn off
        MapMaker.vendor.toggleFilter(toggleEl);
    }
    var vendorId = vendorEl.data("id");
    vendorEl.addClass("deleted");
    $(".vendorBooth .v"+vendorId).addClass("deleted");

    MapMaker.vendorTag.destoryManyInDom(vendorId, true);
}

// Given a vendor DOM element, updates it based on input in a form
MapMaker.vendor.updateInDom = function(vendorEl) {
    var name = $("input[name='vendor_name']").val();
    var url = $("input[name='vendor_url']").val();
    var desc = $("textarea[name='vendor_desc']").val();

    vendorEl.find(".vendor_name").text(name);
    vendorEl.find(".vendor_url").text(url);
    vendorEl.find(".vendor_desc").text(desc);

    MapMaker.vendorTag.updateNamesInDom(name, toolContext.vendorId, true);
}

// Preps the vendor form with data from the vendorEl
MapMaker.vendor.prepForm = function(vendorEl, formEl) {
    var name = vendorEl.find(".vendor_name").text();
    var url = vendorEl.find(".vendor_url").text();
    var desc = vendorEl.find(".vendor_desc").text();

    formEl.find("input[name='vendor_name']").val(name);
    formEl.find("input[name='vendor_url']").val(url);
    formEl.find("textarea[name='vendor_desc']").val(desc);
}

// JS validation of the vendor form
MapMaker.vendor.validate = function(formEl) {
    var inputs = formEl.find("input, textarea");
    // For now, we just validate that there is a name
    if (inputs.first().val().length < 1) {
        return false;
    }
    return true;
}

// TODO !!! Bug -> If one booth has multiple vendors, then toggling one might turn
// off highlighting for something that should have it on
// Idea: use toolContext, store all highlighted vendor id classes
MapMaker.vendor.toggleFilter = function(toggleEl) {
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

// Checks for booths with a vendor and replaces the drag image (circle next to vendor)
//  if there are any
MapMaker.vendor.updateDragAssignEl = function() {
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
////// VENDOR LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

// Loads all event handlers for existing vendor DOM objects and related UI
MapMaker.vendor.loadListeners = function() {
    // Vendor UI
    MapMaker.vendor.addListener_formSubmit();
    MapMaker.vendor.addListener_addClick();
    MapMaker.vendor.addListener_togglePanel();

    // Existing Vendor DOM Objects
    MapMaker.vendor.addListener_nameClick($(".vendorshow a"), false);
    MapMaker.vendor.addListener_updateClick($(".update_vendor"), false);
    MapMaker.vendor.addListener_destoryClick($(".destroy_vendor"), false);
    MapMaker.vendor.addListener_dragstart($(".drag_assign"), false);
    MapMaker.vendor.addListener_toggleHighlighting($(".vendorview_toggle"), false);
}

// Given a newly created temp vendor DOM object or existing, adds the listeners onto it
MapMaker.vendor.addListeners = function(vendorEl, isTemp) {
    MapMaker.vendor.addListener_nameClick(vendorEl, isTemp);
    MapMaker.vendor.addListener_updateClick(vendorEl, isTemp);
    MapMaker.vendor.addListener_destoryClick(vendorEl, isTemp);
    MapMaker.vendor.addListener_dragstart(vendorEl, isTemp);
    MapMaker.vendor.addListener_toggleHighlighting(vendorEl);
}

// Handles the form submission logic
MapMaker.vendor.addListener_formSubmit = function() {
    $("#vendor_form_submit").click(function(e) {
        var formEl = $(this).closest("form");
        if (MapMaker.vendor.validate(formEl)) {
            if (toolContext.vendorAction === ACTIONS.CREATE) { // Add vendor to DOM + log history
                MapMaker.vendor.addToDom();
                MapMaker.vendor.addToHistory();

                // Add to our vendor dict so tag form has access later
                MapMaker.addToVendorDict("t" + MapMaker.lastVendorId, $("input[name='vendor_name']").val());

                toolContext.checkedAfter = MapMaker.checkedIntoSet("t" + MapMaker.lastVendorId, $("#vendor_form ul.assign_vendortags"), true);

                MapMaker.vendorTag.addManyToHistory();
                MapMaker.vendorTag.addManyToDom();
            } else if (toolContext.vendorAction === ACTIONS.UPDATE) { // Update vendor
                MapMaker.vendor.updateToHistory(formEl);
                MapMaker.vendor.updateInDom(toolContext.vendorEl);

                toolContext.checkedAfter = MapMaker.checkedIntoSet(toolContext.vendorEl.data("id"), $("#vendor_form ul.assign_vendortags"), true);

                MapMaker.vendorTag.updateManyToHistory();
                MapMaker.vendorTag.updateManyInDom();
            }
            $(this).closest("div.overlay").hide();
            MapMaker.resetForm(formEl);
        } else { // Error
            formEl.children("div.error").slideDown(300);
        }
        return false;
    })
}

// Clicking vendor name toggles its vendorshow_extra info
MapMaker.vendor.addListener_nameClick = function(vendorEl, isTemp) {
    if (isTemp) {
        vendorEl.find("a.vendor_name").click(function() {
            vendorEl.children(".vendorshow_extra").toggle();
            return false;
        })
    } else {
        $(".vendorshow a").click(function() { // Clicking vendor name toggles its vendorshow_extra info
            $(this).parent().siblings().first().toggle();
        })
    }
}

// Clicking the add button to bring up a fresh vendor form
MapMaker.vendor.addListener_addClick = function() {
    $("#add_vendor").click(function() {
        MapMaker.vendorTag.loadIntoForm($("#vendor_form"), true);
        $("#vendor_form").parent().toggle();
        toolContext.vendorAction = ACTIONS.CREATE;
    })
}

// Clicking the update button causes the form to appear with prefilled fields
MapMaker.vendor.addListener_updateClick = function(vendorEl, isTemp) {
    if (isTemp) { // VendorEl is the entire vendor element, need to attach listener to button
        vendorEl = vendorEl.find(".update_vendor");
    }

    vendorEl.click(function() {
        // Store some information in tool context for easy access once form is up
        toolContext.vendorEl = $(this).closest("li");
        toolContext.vendorAction = ACTIONS.UPDATE;
        toolContext.isTemp = isTemp;
        toolContext.vendorId = toolContext.vendorEl.data("id");

        MapMaker.vendor.prepForm(toolContext.vendorEl, $("#vendor_form"));
        MapMaker.vendorTag.loadIntoForm($("#vendor_form"), true, toolContext.vendorEl);
        $("#vendor_form").parent().toggle();
    })
}

// Clicking on the destroy button destroys the element and logs to history
MapMaker.vendor.addListener_destoryClick = function(vendorEl, isTemp) {
    if (isTemp) {
        vendorEl = vendorEl.find(".destroy_vendor");
    }

    vendorEl.click(function() {
        MapMaker.vendor.deleteToHistory($(this).closest("li"), isTemp);
        MapMaker.vendor.deleteInDom($(this).closest("li"));
    })
}

MapMaker.vendor.addListener_dragstart = function(vendorEl, isTemp) {
    if (isTemp) {
        vendorEl.find(".drag_assign").on("dragstart", function(e) {
            toolContext.vendorId = vendorEl.data("id");
        })
    } else { // Mass assignment using ".drag_assign" directly
        vendorEl.on("dragstart", function(e) {
            var vendorId = $(this).closest("li").data("id");
            toolContext.vendorId = vendorId;
        })
    }
}

// Hitting the view toggle to see which booths have which vendors
MapMaker.vendor.addListener_toggleHighlighting = function(vendorEl, isTemp) {
    if (isTemp) {
        vendorEl.find(".vendorview_toggle").click(function() {
            MapMaker.vendor.toggleFilter($(this));
        })
    } else { // Mass Assign via $(".vendorview_toggle")
        vendorEl.click(function() {
            MapMaker.vendor.toggleFilter($(this));
        })
    }
}

// Hitting the toggle button that causes the vendor panel to appear
MapMaker.vendor.addListener_togglePanel = function() {
    $("#toggle_vendors").click(function() {
        $("#vendor_list").toggle();
        $(this).toggleClass("open");
    })
}