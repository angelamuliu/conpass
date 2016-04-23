
// Cast and Image listeners, event handlers, functions for MapMaker
// Handler of ajax, uploading, deletion, and more of custom user images
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
      dataType: 'script'
    });
    return false;

}

// Handles sending a DELETE AJAX request to the server
MapMaker.cast.destroy = function() {

}

// Loads all event handlers for existing DOM objects that are casts
MapMaker.cast.loadListeners = function() {
    $("#cast_uploader").change(function() {
        // Start upload when user has selected something to upload
        MapMaker.cast.upload();
    })

    $("#cast_bin_toggle").click(function() {
        if ($("#cast_bin").hasClass("offscreen")) { // Scroll into view
            $("#cast_bin").animate({"bottom": "0px" }, 150);
            $("#cast_bin").removeClass("offscreen");
       } else { // Scroll down out of view
            $("#cast_bin").animate({"bottom": "-140px" }, 150);
            $("#cast_bin").addClass("offscreen");
       }
    })
}



