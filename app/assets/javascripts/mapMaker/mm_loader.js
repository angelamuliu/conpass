
// Contains listeners that attach themselves to DOM existing content
// and calls functions from other setup files. Must be loaded last

// Calls all other listener loaders
MapMaker.loadListeners = function() {

    MapMaker.booth.loadListeners();
    MapMaker.vendor.loadListeners();
    MapMaker.tag.loadListeners();

    $('.datetimepicker').datetimepicker();

    MapMaker.loadWorkAreaListeners();
    MapMaker.loadBaseListeners();
}

// Loading all listeners that are related to the work area dom directly
MapMaker.loadWorkAreaListeners = function() {
    MapMaker.workArea.click(function(e) {
        switch(MapMaker.selectedTool) {
            case TOOLS.RECTANGLE:
                break;
            default:
        }
    })

    MapMaker.workArea.mousedown(function(e) {
        switch(MapMaker.selectedTool) {
            case TOOLS.RECTANGLE:
                MapMaker.booth.startMake(e);
                e.preventDefault(); // Stop :focus event from highlighting stuff confusingly
                break;
            default:
        }
    })


    MapMaker.workArea.mouseup(function(e) {
        switch(MapMaker.selectedTool) {
            case TOOLS.RECTANGLE:
                MapMaker.booth.endMake(e);
                break;
            default:
        }
    })
}

// Attaching event handlers for things regarding basic UI such as
// overlays, tool selection, toggling tool bars
MapMaker.loadBaseListeners = function() {
    $("#save").click(MapMaker.saveMap);

    $(".tool").click(function(e) { // Swap tool when tool button pressed
        $(".tool").removeClass("selectedTool");
        MapMaker.selectedTool = this.dataset.type;
        $(this).addClass("selectedTool");
    })

    $(".overlay").click(function() {
        $(this).hide();
        MapMaker.resetForm($(this).children("form"));
    })

    $(".close_overlay").click(function(e) {
        $(this).closest("div.overlay").hide();
        MapMaker.resetForm($(this).closest("form"));
        e.preventDefault();
        return false;
    })

    $(".close_strong_overlay").click(function(e) {
        $(this).closest("div.strong_overlay").hide();
        e.preventDefault();
        return false;
    })

    $(".dismiss_error").click(function(e) {
        $(this).closest(".error").slideUp();
        e.preventDefault();
        return false;
    })

    $(".overlay form").click(function(e) {
        e.stopPropagation();
    })
}
