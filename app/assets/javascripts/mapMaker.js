// This js is only loaded on /maps/{:id}/craft
// It's only used there and we shouldn't ever load it on other pages b/c lag
// If you really want to use it on another page -> <%= javascript_include_tag "mapMaker.js" %>


// We can grab controller vars before dom is loaded FYI
console.log(gon.map);

$(document).ready(function() {

    $("#workArea").css("width", gon.map.width);
    $("#workArea").css("height", gon.map.height);

    $("#workArea").click(createBooth);

})

function createBooth(e) {
    // debugger;
    var offset = $(this).offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;
    console.log(y);
    $("#workArea").append("<div class=\"booth\" style=\"left:"+x+"px;top:"+y+"px\"></div>");
}

// PLAN

// Store action HISTORY as JS and on save press, we pass a JSON object in with information needed to save
// state of the map

// We will save objects in a history array and as we undo, we pop. Redo, push something back on.
// Certain actions in our DB need to happen in order.  Vendors and tags made first, then vendor tags. Finally, booths.

// In addition, we need to store the current 'tool' as this influences what action happens when the work area is clicked.