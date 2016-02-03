
// Map listeners, event handlers, functions for MapMaker
// Accessing  => MapMaker.map.<functionName>

MapMaker.map = {};

MapMaker.map.loadListeners = function() {
    MapMaker.map.addListener_showForm();
    MapMaker.map.addListener_submitForm();

}

MapMaker.map.addListener_showForm = function() {
    $("#map_config").click(function() {
        $("#map_form").parent().show()
    })
}

MapMaker.map.addListener_submitForm = function() {
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
        MapMaker.saveMap();
    })
}