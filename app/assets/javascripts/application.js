// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below. Anything included here can be considered SHARED JS!
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require bootstrap-sprockets
//= require_tree ./global
//= require turbolinks
//= require jquery.turbolinks

$(document).ready(function() {

    // Tab toggle code. To use:
    // Tab headers get the class "tab", and if selected, "selected". data-toggle = ID of container to show when selected
    // Tab data containers get class "tab_data" and id matches with the header
    $("a.tab").on('click touchstart', function() {
        $(".tab").removeClass("selected");
        $(".tab_data").hide();

        var tabDataId_toShow = $(this).data("toggle");
        $("#" + tabDataId_toShow).show();
        $(this).addClass("selected");
    })


    // Overlay code -> Give anything the class "close_overlay" so clicking it will close
    // Use: Wrap whatever you want in overlay with div with class overlay
    $(".close_overlay").click(function(e) {
        $(this).closest("div.overlay").hide();
        e.preventDefault();
        return false;
    })
    $(".overlay").click(function() {
        $(this).hide();
    })
    $(".overlay form").click(function(e) {
        e.stopPropagation();
    })

})




// ------------------------------------------------

// Probably should move this later

// USED ON: MAP SHOW PAGE
// centers view on the booth and highlights it too
function centerOnBooth() {
    $(".booth").removeClass("highlight");
    $("ul.vendorBooth").slideUp();

    var booth = $(this);
    center(booth);

    $(this).addClass("highlight");
    $(this).children("ul.vendorBooth").slideDown();
}
function center(boothEl) {
    var boothX = parseInt(boothEl.css("left"));
    var boothY = parseInt(boothEl.css("top"));
    var boothWidth = parseInt(boothEl.css("width"));

    var left = -boothX - 0.5 * boothWidth + 0.5 * (window.innerWidth);
    var top = -boothY;

    $("#mapArea").css("left", left);
    $("#mapArea").css("top", top);
}
function closeVendorBooth(event) {
    event.stopPropagation();
    $("ul.vendorBooth").slideUp();
}
$(document).ready(function() {
    $(".booth").click(centerOnBooth);
    // $(".booth").on("click touchstart", centerOnBooth);

})

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






