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





// SHould move this later
// USED ON: MAP SHOW PAGE
// centers view on the booth and highlights it too
function center(boothEl) {
    var boothX = parseInt(boothEl.css("left"));
    var boothY = parseInt(boothEl.css("top"));
    var boothWidth = parseInt(boothEl.css("width"));

    var left = -boothX - 0.5 * boothWidth + 0.5 * (window.innerWidth);
    var top = -boothY;

    $("#mapArea").css("left", left);
    $("#mapArea").css("top", top);
}
function centerOnBooth() {
    // debugger;
    $(".booth").removeClass("highlight");
    $("ul.vendorBooth").slideUp();

    var booth = $(this);
    center(booth);

    $(this).addClass("highlight");
    $(this).children("ul.vendorBooth").slideDown();
}
function centerOnBoothWithId(boothId) {
    var booth = $(".booth[data-id="+boothId+"]");
    $(".booth").removeClass("highlight");
    $("ul.vendorBooth").slideUp();

    center(booth);

    booth.addClass("highlight");
    booth.children("ul.vendorBooth").slideDown();
}
