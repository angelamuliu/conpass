
$(document).ready(function() {
    $(".booth").click(centerOnBooth);
})


function closeVendorBooth(event) {
    event.stopPropagation();
    $("ul.vendorBooth").slideUp();
}

// ------------------------------------------------

// Should definitely move this elsewhere sometime

// ZOOMING IN/OUT
var zoomOptions = [0.5, 1, 2, 4];
var zoomIndex = 1; // Refers to index in array above, 1 => 1

function zoomIn() {
    if (zoomIndex < zoomOptions.length - 1) {
        zoomIndex++;
        var zoomFactor = zoomOptions[zoomIndex] / zoomOptions[zoomIndex - 1];
        zoom(zoomFactor);
    }
}
function zoomOut() {
    if (zoomIndex > 0) {
        zoomIndex--;
        var zoomFactor = zoomOptions[zoomIndex] / zoomOptions[zoomIndex + 1];
        zoom(zoomFactor);
    }
}
function zoom(zoomFactor) {
    // First zoom the map
    var mapWidth = parseInt($("#mapArea").css("width"));
    var mapHeight = parseInt($("#mapArea").css("height"));
    $("#mapArea").css("width", mapWidth * zoomFactor);
    $("#mapArea").css("height", mapHeight * zoomFactor);

    // Zoom the booths
    var booths = $(".booth");
    for (var i = 0; i < booths.length; i++) {
        var booth = $(booths[i]);
        var boothX = parseInt(booth.css("left"));
        var boothY = parseInt(booth.css("top"));
        var boothWidth = parseInt(booth.css("width"));
        var boothHeight = parseInt(booth.css("height"));

        booth.css("left", boothX * zoomFactor);
        booth.css("top", boothY * zoomFactor);
        booth.css("width", boothWidth * zoomFactor);
        booth.css("height", boothHeight * zoomFactor);
    }

    // Recenter on the highlighted booth if any
    if ($(".booth.highlight").length > 0) {
        center($(".booth.highlight").first());
    }
}


// ------------------------------------------------

function vendor_toggle(x) {
    if($('[data-id=' + x + ']')[0].children[0].style.display = "none")
    {
        $('[data-id=' + x + ']')[0].children[0].style.display = "block";
    }
    else
    {
        $('[data-id=' + x + ']')[0].children[0].style.display = "none";
    }
}



