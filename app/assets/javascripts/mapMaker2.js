
// MAP MAKER
// Allows drag drop and other JS interaction on the map making page
// This file controls load order and initializes models reliant on DOM

// This js is only loaded on /maps/{:id}/craft
// It's only used there and we shouldn't ever load it on other pages b/c lag
// If you really want to use it on another page -> <%= javascript_include_tag "mapMaker.js" %>

// We can grab controller vars before dom is loaded FYI
// console.log(gon.map);

//= require jquery.datetimepicker

//= require ./mapMaker/mm_starter.js
//= require ./mapMaker/mm_helperSetup.js
//= require ./mapMaker/mm_boothSetup.js
//= require ./mapMaker/mm_vendorTagSetup.js
//= require ./mapMaker/mm_vendorSetup.js
//= require ./mapMaker/mm_tagSetup.js
//= require ./mapMaker/mm_loader.js 

$(document).ready(function() {

    $("#workArea").css("width", gon.map.width);
    $("#workArea").css("height", gon.map.height);

    MapMaker.workArea = $("#workArea");
    MapMaker.toolBar = $("#toolBar");

    MapMaker.loadVendorDict(gon.vendors);
    MapMaker.loadTagDict(gon.tags);

    MapMaker.loadListeners();
})