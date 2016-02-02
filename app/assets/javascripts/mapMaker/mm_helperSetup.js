
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
////// HELPERS
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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

// Given the vendorbooth form element, gets a top left corner and edits the vendorBooth form DOM object
MapMaker.prepVendorBoothForm = function(vendorbooth_formEl, vendorBoothEl) {
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

MapMaker.showVendorBoothForm = function(vendorbooth_formEl) {
    vendorbooth_formEl.parent().show();
}

// Preps tag form with data from a tag El
MapMaker.prepTagForm = function(tagEl, formEl) {
    var name = tagEl.find(".tag_name").text();
    formEl.find("input[name='tag_name']").val(name);
}

// Reload the vendortag listings into either the tag or vendor form
// id = the vendor or tag id to apply to. If new object, -1
MapMaker.loadVendortagsIntoForm = function(formEl, isVendorForm, modelEl) {
    var assignEl = formEl.find(".assign_vendortags");
    assignEl.empty();
    if (modelEl === undefined) { // NEW forms, nothing checked before
        var id = -1;
        toolContext.checkedBefore = new Set();
        if (isVendorForm) { // Making new vendor
            for (var key in this.tagDict) {
                assignEl.append("<li><input type=\"checkbox\" data-tid="+key+" data-vid="+id+">"+this.tagDict[key]+"</li>");
            }
        } else { // Making new tag
            for (var key in this.vendorDict) {
                assignEl.append("<li><input type=\"checkbox\"data-tid="+id+" data-vid="+key+">"+this.vendorDict[key]+"</li>");
            }
        }
    } else { // UPDATE forms
        var id = modelEl.data("id");
        if (isVendorForm) { // Updating vendor
            toolContext.checkedBefore = checkedIntoSet(id, modelEl.find(".vendor_tags"), true);
            for (var key in this.tagDict) {
                var checkbox = $("<li><input type=\"checkbox\" data-tid="+key+" data-vid="+id+">"+this.tagDict[key]+"</li>");
                if (toolContext.checkedBefore.has("vendor-" + id + "_tag-" + key)) {
                    checkbox.children("input").prop("checked", true);
                }
                assignEl.append(checkbox);
            }
        } else { // Updating tag
            toolContext.checkedBefore = checkedIntoSet(id, modelEl.children(".tagshow_extra"), false);
            for (var key in this.vendorDict) {
                var checkbox = $("<li><input type=\"checkbox\"data-tid="+id+" data-vid="+key+">"+this.vendorDict[key]+"</li>");
                if (toolContext.checkedBefore.has("vendor-" + key + "_tag-" + id)) {
                    checkbox.children("input").prop("checked", true);
                }
                assignEl.append(checkbox);
            }
        }
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
    var day = numToDayOfWeek(date.getDay()); // e.g. "Mon"
    var hour = date.getHours() % 13;
    var period = date.getHours() > 11 ? "pm" : "am";
    var min = date.getMinutes();
    min = min < 10 ? "0" + min : min;
    return month + "/" + dateDay + " " + day + " " + hour + ":" + min + " " + period;
}

// Given the shorted date form, reexpands to form like "2015/10/09 02:00"
MapMaker.expandDate = function(datestring) {
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

