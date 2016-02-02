
// Tag listeners, event handlers, functions for MapMaker
// Accessing  => MapMaker.tag.<functionName>

MapMaker.tag = {};

MapMaker.tag.addToHistory = function() {
    var name = $("input[name='tag_name']").val();
    var tagHistory = {
        "action" : ACTIONS.CREATE,
        "type": TYPES.TAG,
        "id" : "t" + MapMaker.lastTagId,
        "name" : name,
        "isTemp" : true
    }
    actionHistory.push(tagHistory);
}

MapMaker.tag.deleteToHistory = function(tagEl, isTemp) {
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

MapMaker.tag.updateToHistory = function() {
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

MapMaker.tag.makeEl = function(name, tagId) {
    var newTagEl = $("<li data-id=\"t"+tagId+"\" class=\"tag\">" +
                        "<div class=\"tagshow\">" +
                            "<a href=\"javascript:;\" class=\"tag_name\">"+ name + "</a>" +
                            "<div class=\"tag_options\">" +
                                "<a href=\"javascript:;\" class=\"update_tag\"><i class=\"fa fa-pencil\"></i></a> " +
                                "<a href=\"javascript:;\" class=\"destroy_tag\"><i class=\"fa fa-trash\"></i></a>" +
                            "</div>" +
                        "</div>" +
                        "<ul class=\"tagshow_extra\"></ul>" +
                        "</li>");
    return newTagEl;
}

MapMaker.tag.addToDom = function() {
    // Hide the tip that appears by default
    $("#tag_list li.no_models").remove();

    MapMaker.lastTagId++;
    var name = $("input[name='tag_name']").val();
    var newTagEl = MapMaker.tag.makeEl(name, MapMaker.lastTagId);
    $("#tag_list ul").first().append(newTagEl);
    MapMaker.tag.addListeners(newTagEl, true);
}

MapMaker.tag.deleteInDom = function(tagEl) {
    tagEl.addClass("deleted");
    MapMaker.vendorTag.deleteManyInDom(tagEl.data("id"), false);
}

MapMaker.tag.updateInDom = function() {
    var name = $("input[name='tag_name']").val();
    toolContext.tagEl.find(".tag_name").text(name);

    MapMaker.vendorTag.updateNamesInDom(name, toolContext.tagEl.data("id"), false);
}

// TODO! INCOMPLETE!
MapMaker.tag.validate = function(formEl) {
    if ($("input[name='tag_name']").val().length < 1) {
        return false;
    }
    return true;
}

// Preps tag form with data from a tag El
MapMaker.tag.prepForm = function(tagEl, formEl) {
    var name = tagEl.find(".tag_name").text();
    formEl.find("input[name='tag_name']").val(name);
}

    // ------------------------------------------------------------
////// TAG LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

MapMaker.tag.loadListeners = function() {
    // UI listeners
    MapMaker.tag.addListener_togglePanel();
    MapMaker.tag.addListener_addClick();
    MapMaker.tag.addListener_formSubmit();

    // Existing tag DOM element listeners
    MapMaker.tag.addListeners($(".tag"), false);
}

// Addds all necessary listeners to a fresh temp tag DOM element
MapMaker.tag.addListeners = function(tagEl, isTemp) {
    MapMaker.tag.addListener_nameClick(tagEl);
    MapMaker.tag.addListener_updateClick(tagEl, isTemp);
    MapMaker.tag.addListener_destroyClick(tagEl, isTemp);
}

// Hooks up the tag add button
MapMaker.tag.addListener_addClick = function() {
    $("#add_tag").click(function() {

        MapMaker.vendorTag.loadIntoForm($("#tag_form"), false);

        $("#tag_form").parent().toggle();
        toolContext.tagAction = ACTIONS.CREATE;
    })
}

MapMaker.tag.addListener_formSubmit = function() {
    $("#tag_form_submit").click(function() {
        var formEl = $(this).closest("form");
        if (MapMaker.tag.validate(formEl)) {
            if (toolContext.tagAction === ACTIONS.CREATE) {
                MapMaker.tag.addToDom();
                MapMaker.tag.addToHistory();

                // Add to our tag dict so vendor form has access later
                MapMaker.addToTagDict("t" + MapMaker.lastTagId, $("input[name='tag_name']").val());

                toolContext.checkedAfter = MapMaker.checkedIntoSet("t" + MapMaker.lastTagId, $("#tag_form ul.assign_vendortags"), false);

                MapMaker.vendorTag.addManyToHistory();
                MapMaker.vendorTag.addManyToDom();
            } else if (toolContext.tagAction === ACTIONS.UPDATE) {
                MapMaker.tag.updateInDom();
                MapMaker.tag.updateToHistory();

                toolContext.checkedAfter = MapMaker.checkedIntoSet(toolContext.tagEl.data("id"), $("#tag_form ul.assign_vendortags"), false);

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

// Toggles the tag panel visibility
MapMaker.tag.addListener_togglePanel = function() {
    $("#toggle_tags").click(function() {
        $("#tag_list").toggle();
        $(this).toggleClass("open");
    })
}

MapMaker.tag.addListener_nameClick = function(tagEl) {
    tagEl.find(".tag_name").click(function() {
        tagEl = $(this).closest(".tag");
        tagEl.children(".tagshow_extra").toggle();
    })
}

MapMaker.tag.addListener_destroyClick = function(tagEl, isTemp) {
    tagEl.find(".destroy_tag").click(function() {
        tagEl = $(this).closest(".tag");
        MapMaker.tag.deleteToHistory(tagEl, isTemp);
        MapMaker.tag.deleteInDom(tagEl);
    })
}

MapMaker.tag.addListener_updateClick = function(tagEl, isTemp) {
    tagEl.find(".update_tag").click(function() {
        tagEl = $(this).closest(".tag");

        toolContext.tagAction = ACTIONS.UPDATE;
        toolContext.isTemp = isTemp;
        toolContext.tagEl = tagEl;

        MapMaker.tag.prepForm(tagEl, $("#tag_form"));

        MapMaker.vendorTag.loadIntoForm($("#tag_form"), false, tagEl);
        $("#tag_form").parent().toggle();
    })
}

