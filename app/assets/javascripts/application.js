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
//= require jquery.datetimepicker
//= require bootstrap-sprockets
//= require_tree ./global

$(document).ready(function() {

    // Tab toggle code. To use:
    // Tab headers get the class "tab", and if selected, "selected". data-toggle = ID of container to show when selected
    // Tab data containers get class "tab_data" and id matches with the header
    $("a.tab").on('click touchstart', function() {
        $(".tab").removeClass("selected");
        $(".tab_data").removeClass("selected");

        var tabDataId_toShow = $(this).data("toggle");
        $("#" + tabDataId_toShow).addClass("selected");
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




    // MOVE THIS LATER
    // GEOLOCATION ON FIRST PAGE - to get user's location to autofill a field
    // check for Geolocation support
    if (navigator.geolocation) {
      console.log('Geolocation is supported!');
    }
    else {
      console.log('Geolocation is not supported for this Browser/OS version yet.');
    }

})



// MOVE LATER
// USED ON: MAP SHOW PAGE
// centers view on the booth and highlights it too
function center(boothEl) {
    // TODO: ADD BACK IN ONCE YOU CAN SCROLL OR NAVIGATE MAP,
    // right now it locks it so that if you center, you can't see booths above


    // var boothX = parseInt(boothEl.css("left"));
    // var boothY = parseInt(boothEl.css("top"));
    // var boothWidth = parseInt(boothEl.css("width"));

    // var left = -boothX - 0.5 * boothWidth + 0.5 * (window.innerWidth);
    // var top = -boothY;

    // $("#mapArea").css("left", left);
    // $("#mapArea").css("top", top);
}
function centerOnBooth() {
    $(".booth").removeClass("highlight");

    // TODO: Find better way of showing nearby vendor information
    // $("ul.vendorBooth").slideUp();

    var booth = $(this);
    center(booth);

    $(this).addClass("highlight");

    // TODO: Find better way of showing nearby vendor information
    // $(this).children("ul.vendorBooth").slideDown();
}
function centerOnBoothWithId(boothId) {
    var booth = $(".booth[data-id="+boothId+"]");
    $(".booth").removeClass("highlight");

    // TODO: Find better way of showing nearby vendor information
    // $("ul.vendorBooth").slideUp();

    center(booth);

    booth.addClass("highlight");

    // TODO: Find better way of showing nearby vendor information
    // booth.children("ul.vendorBooth").slideDown();
}
