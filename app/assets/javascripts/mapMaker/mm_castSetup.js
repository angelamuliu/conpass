
// Cast and Image listeners, event handlers, functions for MapMaker
// Handler of ajax, uploading, deletion, and more of casts (uploaded user images)
// Accessing  => MapMaker.cast.<functionName>

MapMaker.cast = {};

    // ------------------------------------------------------------
////// CASTS
    // ------------------------------------------------------------
    // Casts are not logged to history, as they are uploaded and destroyed via AJAX

// Handes sending a POST AJAX request to the server
MapMaker.cast.upload = function() {
    var formData = new FormData(),
    $input = $('#cast_uploader');
    
    formData.append('cast[upload]', $input[0].files[0]);
    formData.append('cast[convention_id]', gon.map.convention_id);

    $.ajax({
      url: '/casts',
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      dataType: 'script',
      beforeSend: function() {

      }
    });
    return false;
}

// Handles sending a DELETE AJAX request to the server
MapMaker.cast.destroy = function(castId) {
    $.ajax({
        url: '/casts/'+castId,
        type: 'DELETE',
        beforeSend: function() {

        }
    })
    return false;
}

    // ------------------------------------------------------------
////// CAST LISTENERS/EVENT HANDLERS
    // ------------------------------------------------------------

// Loads all event handlers for existing DOM objects that are casts
MapMaker.cast.loadListeners = function() {
    $("#cast_uploader").change(function() {
        // Start upload when user has selected something to upload
        MapMaker.cast.upload();
    })

    // Hooking up toggle display of bin button
    $("#cast_bin_toggle").click(function() {
        if ($("#cast_bin").hasClass("offscreen")) { // Scroll into view
            $("#cast_bin").animate({"bottom": "0px" }, 150);
            $("#cast_bin").removeClass("offscreen");
       } else { // Scroll down out of view
            $("#cast_bin").animate({"bottom": "-140px" }, 150);
            $("#cast_bin").addClass("offscreen");
       }
    })
    MapMaker.cast.addListeners_DnD();
    MapMaker.cast.addListeners($("li.cast"));
}

// Given a DOM element that is a cast, attaches the drag and drop listeners
MapMaker.cast.addListeners = function(castEl) {
    MapMaker.cast.addListener_dragstart(castEl);
}

MapMaker.cast.addListener_dragstart = function(castEl) {
    castEl.on("dragstart", function(e) {
        toolContext.castId = $(this).data("id");
        toolContext.castURL = $(this).children("img").attr("src");
        toolContext.draggingType = TYPES.CAST;
    })
}

// Attaches drag and drop listeners to the dropzone ("#workArea")
MapMaker.cast.addListeners_DnD = function() {
    MapMaker.cast.addListener_dragenter();
    MapMaker.cast.addListener_dragleave();
    MapMaker.cast.addListener_dragover();
    MapMaker.cast.addListener_drop();
}

MapMaker.cast.addListener_dragenter = function() {
    MapMaker.workArea.on("dragenter", function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
}

MapMaker.cast.addListener_dragleave = function(boothEl) {
    MapMaker.workArea.on("dragleave", function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
}

MapMaker.cast.addListener_dragover = function(boothEl) {
    MapMaker.workArea.on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    })
}

// Attaches a listener to the workarea to listen for cast drops
MapMaker.cast.addListener_drop = function() {
    MapMaker.workArea.on("drop", function(e, ui) {
        if (toolContext.draggingType === TYPES.CAST) {
            debugger;
            e.preventDefault();
            e.stopPropagation();

            var offset = MapMaker.workArea.offset();
            var downX = event.clientX - offset.left;
            var downY = event.clientY - offset.top;

            // MapMaker.image.addToHistory(event.clientX, event.clientY, toolContext.castId);
            var imageEl = MapMaker.image.makeEl(downX, downY, toolContext.castId, toolContext.castURL);
            // MOVE LATER
            MapMaker.workArea.append(imageEl);
        }
    })
}
