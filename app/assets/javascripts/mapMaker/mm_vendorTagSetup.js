
// Vendor Tag listeners, event handlers, functions for MapMaker
// Accessing  => MapMaker.vendorTag.<functionName>

MapMaker.vendorTag = {};

// Given that vendor tags are in toolContext.checkedAfter like "vendor-1_tag-1", adds
// them all into a single history action (for the new tag.vendor form, all must be create)
MapMaker.vendorTag.addManyToHistory = function() {
    var vendorTagHistory = {
        "type" : TYPES.VENDOR_TAG,
        "create" : Array.from(toolContext.checkedAfter),
        "destroy" : []
    }
    actionHistory.push(vendorTagHistory);
}

// With the vendor tags that were tagged before (toolContext.checkedBefore), logs BOTH new
// creates and destroys depending on what is checked afterwards
MapMaker.vendorTag.updateManyToHistory = function() {
    toolContext.checkedBefore;
    toolContext.createDestroyMap = MapMaker.getCreatesAndDeletes(toolContext.checkedBefore, toolContext.checkedAfter);
    var vendorTagHistory = {
        "type" : TYPES.VENDOR_TAG,
        "create" : toolContext.createDestroyMap["create"],
        "destroy" : toolContext.createDestroyMap["destroy"]
    }
    actionHistory.push(vendorTagHistory);
}

// Given the vendor tag ID pair (ex: "vendor-1_tag-1"), adds to DOM for associated
// vendor and tag sections
MapMaker.vendorTag.addToDom = function(vendorTagId) {
    var tagId = MapMaker.getTagIdFromVendorTag(vendorTagId);
    var vendorId = MapMaker.getVendorIdFromVendorTag(vendorTagId);
    var tagName = $("#tag_list li[data-id="+tagId+"] .tag_name").text();
    var vendorName = $("#vendor_list li[data-id="+vendorId+"] .vendor_name").text();

    // Update tag listing
    $("#tag_list li[data-id="+tagId+"] .tagshow_extra").append("<li class=\"vendorTag\" data-id=\""+vendorId+"\">"+vendorName+"</li>");

    // Update vendor listing
    $("#vendor_list li[data-id="+vendorId+"] .vendorshow_extra .vendor_tags").append("<li class=\"vendorTag\" data-id=\""+tagId+"\">"+tagName+"</li>");
}

// Given the vendor tag ID pair (ex: "vendor-1_tag-1"), removes it from DOM
// from associated vendor and tag sections
MapMaker.vendorTag.destroyInDom = function(vendorTagId) {
    var tagId = MapMaker.getTagIdFromVendorTag(vendorTagId);
    var vendorId = MapMaker.getVendorIdFromVendorTag(vendorTagId);
    var tagName = $("#tag_list li[data-id="+tagId+"] .tag_name").text();
    var vendorName = $("#vendor_list li[data-id="+vendorId+"] .vendor_name").text();

    // Update tag listing
    $("#tag_list li[data-id="+tagId+"] .vendorTag[data-id="+vendorId+"]").remove();

    // Update vendor listing
    $("#vendor_list li[data-id="+vendorId+"] .vendorTag[data-id="+tagId+"]").remove();
}

// Given a set of "vendor-1_tag-1" strings within the tool context, adds vendor tags to associated
// vendors, tags in the DOM
MapMaker.vendorTag.addManyToDom = function() {
    var vendorName; var vendorId; var tagName; var tagId;
    toolContext.checkedAfter.forEach(function(vendorTagId) {
        MapMaker.vendorTag.addToDom(vendorTagId);
    })
}

// If a tag or vendor is deleted, we need to delete the vendor tag as well and update
// the dict. No need to log since relations are handled
MapMaker.vendorTag.destroyManyInDom = function(id, isVendor) {
    if (isVendor) { // Vendor was destroyed
        delete vendorDict[id];
        $("#tag_list .vendorTag[data-id="+id+"]").addClass("deleted");
    } else { // Tag was destroyed
        delete tagDict[id];
        $("#vendor_list .vendorTag[data-id="+id+"]").addClass("deleted");
    }
}

// Given a map with create and destroy actions, updates and removes vendor tags in
// the DOM as necessary
MapMaker.vendorTag.updateManyInDom = function() {
    // CREATE NEW TAGS
    for (var i = 0; i < toolContext.createDestroyMap["create"].length; i++) {
        MapMaker.vendorTag.addToDom(toolContext.createDestroyMap["create"][i]);
    }
    for (var i = 0; i < toolContext.createDestroyMap["destroy"].length; i++) {
        MapMaker.vendorTag.destroyInDom(toolContext.createDestroyMap["destroy"][i]);
    }
}

// If a tag or vendor update changes the name, we'll have to update the vendortags
// associated as a result
MapMaker.vendorTag.updateNamesInDom = function(newName, id, isVendor) {
    if (isVendor) { // Vendor name update
        $("#tag_list .vendorTag[data-id="+id+"]").text(newName);
        MapMaker.vendorDict[id] = newName;
    } else { // Tag name update
        $("#vendor_list .vendorTag[data-id="+id+"]").text(newName);
        MapMaker.tagDict[id] = newName;
    }
}


// Reload the vendortag listings into either the tag or vendor form
// id = the vendor or tag id to apply to. If new object, -1
MapMaker.vendorTag.loadIntoForm = function(formEl, isVendorForm, modelEl) {
    var assignEl = formEl.find(".assign_vendortags");
    assignEl.empty();
    if (modelEl === undefined) { // NEW forms, nothing checked before
        var id = -1;
        toolContext.checkedBefore = new Set();
        if (isVendorForm) { // Making new vendor
            for (var key in MapMaker.tagDict) {
                assignEl.append("<li><input type=\"checkbox\" data-tid="+key+" data-vid="+id+">"+MapMaker.tagDict[key]+"</li>");
            }
        } else { // Making new tag
            for (var key in MapMaker.vendorDict) {
                assignEl.append("<li><input type=\"checkbox\"data-tid="+id+" data-vid="+key+">"+MapMaker.vendorDict[key]+"</li>");
            }
        }
    } else { // UPDATE forms
        var id = modelEl.data("id");
        if (isVendorForm) { // Updating vendor
            toolContext.checkedBefore = MapMaker.checkedIntoSet(id, modelEl.find(".vendor_tags"), true);
            for (var key in MapMaker.tagDict) {
                var checkbox = $("<li><input type=\"checkbox\" data-tid="+key+" data-vid="+id+">"+MapMaker.tagDict[key]+"</li>");
                if (toolContext.checkedBefore.has("vendor-" + id + "_tag-" + key)) {
                    checkbox.children("input").prop("checked", true);
                }
                assignEl.append(checkbox);
            }
        } else { // Updating tag
            toolContext.checkedBefore = MapMaker.checkedIntoSet(id, modelEl.children(".tagshow_extra"), false);
            for (var key in MapMaker.vendorDict) {
                var checkbox = $("<li><input type=\"checkbox\"data-tid="+id+" data-vid="+key+">"+MapMaker.vendorDict[key]+"</li>");
                if (toolContext.checkedBefore.has("vendor-" + key + "_tag-" + id)) {
                    checkbox.children("input").prop("checked", true);
                }
                assignEl.append(checkbox);
            }
        }
    }
}
