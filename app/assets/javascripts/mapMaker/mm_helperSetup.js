
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
////// HELPER FUNCTIONS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Returns the z index value depending on current selected layer
MapMaker.getLayerZ = function() {
    switch(MapMaker.currentLayer) {
        case LAYERS.BACKGROUND:
            return 15;
        case LAYERS.BELOW_BOOTH:
            return 20;
        case LAYERS.ABOVE_BOOTH:
            return 35;
        case LAYERS.TOP:
            return 40;
        default:
            return 1
    }
}

// Given two sets of x, y that define the zone of a rectangle
// returns topleft coords as [x,y]
MapMaker.findTopLeft = function(x1, y1, x2, y2) {
    var x = x1 < x2 ? x1 : x2;
    var y = y1 < y2 ? y1 : y2;
    return [x, y];
}

// Given two x points defining horizonal of a rectangle, returns width
MapMaker.findWidth = function(x1, x2) {
    return Math.abs(x1 - x2);
}

// Given two y points defining vertical of a rectangle, returns height
MapMaker.findHeight = function(y1, y2) {
    return Math.abs(y1 - y2);
}

// Clears all inputs and hides all error divs
MapMaker.resetForm = function(formEl) {
    formEl.children("div.error").hide();
    var inputs = formEl.find("input, textarea");
    for (var i = 0; i < inputs.length; i++) {
        $(inputs[i]).val("");
    }
}

// Given a number between 0 - 6, converts to string that is day of week
MapMaker.numToDayOfWeek = function(num) {
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

MapMaker.removeBlanks = function(arr) {
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
MapMaker.formatDate = function(date) {
    var month = date.getMonth() + 1; // JS date starts at 0 so add 1
    var dateDay = date.getDate();
    var day = MapMaker.numToDayOfWeek(date.getDay()); // e.g. "Mon"
    var hour = date.getHours() % 13;
    var period = date.getHours() > 11 ? "pm" : "am";
    var min = date.getMinutes();
    min = min < 10 ? "0" + min : min;
    return month + "/" + dateDay + " " + day + " " + hour + ":" + min + " " + period;
}

// Given the shorted date form, reexpands to form like "2015/10/09 02:00"
MapMaker.expandDate = function(datestring) {
    var datePieces = MapMaker.removeBlanks(datestring.split(" "));
    var month = datePieces[0].split("/")[0];
    var day = Number(datePieces[0].split("/")[1]);
    if (day < 10) {
        day = "0" + day;
    }
    var period = datePieces[2].substring(datePieces[2].length - 2);
    var hour = Number(datePieces[2].split(":")[0]);
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

// Given some DOM element, returns true if its a temp object and false if not
// Searches for a "t" in the data-id field to identify
MapMaker.isTemp = function(domEl) {
    if ((typeof(domEl.data("id")) === "string") && (domEl.data("id").charAt(0) === "t")) {
        return true;
    } return false;
}

// Given a DOM element, extracts the vendor ID through the class ("v19" -> vendor ID = 19)
MapMaker.extractVendorId = function(domEl) {
    var re = /^v\d+$/; // REGEX for v11111+
    var classes = domEl.classList;
    for (var i = 0; i < classes.length; i++) {
        if (re.test(classes[i])) { // Matches vendor class with ID pattern
            return parseInt(classes[i].substring(1)) // Return just ID number
        }
    }
}

// Initializes the vendor dict with id and name values
MapMaker.loadVendorDict = function(initialVendors) {
    for (var i = 0; i < initialVendors.length; i++) {
        var vendorObj = initialVendors[i];
        this.vendorDict[vendorObj["id"]] = vendorObj["name"];
    }
}

// Initializes the tag dict with id and name values
MapMaker.loadTagDict = function(initialTags) {
     for (var i = 0; i < initialTags.length; i++) {
        var tagObj = initialTags[i];
        this.tagDict[tagObj["id"]] = tagObj["name"];
    }
}

MapMaker.addToVendorDict = function(id, name) {
    this.vendorDict[id] = name;
}

MapMaker.addToTagDict = function(id, name) {
    this.tagDict[id] = name;
}

// Given a ul element with li elements, creates set with "vendor-1_tag-1" where num = ID or temp ID
MapMaker.checkedIntoSet = function(id, ulEl, isVendor) {
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
MapMaker.getCreatesAndDeletes = function(beforeSet, afterSet) {
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

MapMaker.getVendorIdFromVendorTag = function(vendorTagId) {
    return vendorTagId.split("_")[0].substring(7);
}

MapMaker.getTagIdFromVendorTag = function(vendorTagId) {
    return vendorTagId.split("_")[1].substring(4);
}

MapMaker.saveMap = function() {
    $.ajax({
      type: "POST",
      url: "/maps/"+gon.map.id+"/save",
      data: {
        actionHistory: JSON.stringify(actionHistory)
      },
      beforeSend: function() {
        MapMaker.showSaving();
      },
      error: function() {
        setTimeout(MapMaker.saveError, 300);
        setTimeout(MapMaker.hideSaving, 2000);
        actionHistory = []; // Clear history on save for now
      },
      success: function() {
        MapMaker.saveSuccessful();
        setTimeout(MapMaker.hideSaving, 500);
        actionHistory = []; // Clear history on save for now
        location.reload(); // Refresh page
      }
    });
}

// Saving craft tip functions 
MapMaker.showSaving = function() {
    $("#saveSuccess").hide()
    $("#saveError").hide();

    $("#saving").parent().show();
    $("#currentlySaving").show();
    $("#saving").slideDown(200);
}

MapMaker.hideSaving = function() {
    $("#saving").slideUp(200, function () {
        $("#saving").parent().hide();
    });
}

MapMaker.saveSuccessful = function() {
    $("#currentlySaving").hide();
    $("#saveSuccess").show();
}

MapMaker.saveError = function() {
    $("#currentlySaving").hide();
    $("#saveError").show();
}

