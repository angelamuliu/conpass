//Function To Display Popup
function div_show() {
document.getElementById('openHere').style.display = "block";
}
//Function to Hide Popup
function div_hide(){
document.getElementById('openHere').style.display = "none";
}

// By default starts chronological
function alphabetize(){
    if ($("#alphabet").text().indexOf("ABC") > -1) { // Sort alphabetical
        document.getElementById('chronological').style.display = "none";
        document.getElementById('alphabetical').style.display = "block";
        document.getElementById('alphabet').innerHTML = "Sort (Chronological)";
    } else { // Sort chronological
        document.getElementById('chronological').style.display = "block";
        document.getElementById('alphabetical').style.display = "none";
        document.getElementById('alphabet').innerHTML = "Sort (ABC)";
    }
}

function sort() {
	var conventions = Array.prototype.slice.call(document.getElementsByClassName('con_id'));
	if (document.getElementById('r1').checked) {
		var x = JSON.parse(document.getElementById('current_data').innerHTML);
		for (i = 0; i < conventions.length; i++) {
       	 		var ele = conventions[i];
			if (x.indexOf(parseInt(ele.innerHTML)) < 0 ){
				ele.parentElement.style.display = "none";
			}
		}
 	}
	else if (document.getElementById('r2').checked)
	{
		var x = JSON.parse(document.getElementById('upcoming_data').innerHTML);
		for (i = 0; i < conventions.length; i++) {
       	 		var ele = conventions[i];
			if (x.indexOf(parseInt(ele.innerHTML)) < 0 )
			{
				ele.parentElement.style.display = "none";
			}
 		}
	}
	else 
	{
		for (i = 0; i < conventions.length; i++) {
       		 	var ele = conventions[i];
			ele.parentElement.style.display = "block";
 		}
	}
	div_hide();
}

function vendors() {
	if (document.getElementById('map_title').style.color == 'black')
	{
		document.getElementById('convention_maps').style.display = "none";
		document.getElementById('vendors').style.display = "block";
		document.getElementById('sub_header').innerHTML = '<div onclick ="vendors()" id = "title" class="col-xs-7"><!-- inline styling for javascript, will fix --><a href="#"id="vendor_title" style="color:black;"> Vendors</a></div><div  onclick ="alphabetize_show()" class="col-xs-2"><a href="#"id="alphabet">ABC</a></div><div class="col-xs-1 filter" style="margin-top:0px !important"><a id="popup" onclick="div_show() href="#"><i class="fa fa-filter"></i></a></div><div class="col-xs-1" style="margin-top:0px !important"><a id="map_icon" onclick="maps()" href="#"><i class="fa fa-map"></i></a></div>';
	}
}

function maps() {
	if (document.getElementById('vendor_title').style.color == 'black')
	{
		document.getElementById('maps').style.display = "block";
		document.getElementById('convention_vendors').style.display = "none";
		document.getElementById('sub_header').innerHTML = '<div onclick ="maps()" id = "title" class="col-xs-8"><!-- inline styling for javascript, will fix --><a href="#"id="map_title" style="color:black;">Convention Maps</a> </div> <div  onclick ="vendors()" class="title col-xs-4"><a href="#"id="vendor_title"> Vendors</a></div>';
	}
}

function star(x) {
	if (document.getElementById('star' + x).innerHTML = '<i class="fa fa-star-o"></i>')
	{
		document.getElementById('star' + x).innerHTML = '<i class="fa fa-star"></i>';
	}
	else 	if (document.getElementById('star' + x).innerHTML = '<i class="fa fa-star"></i>')
	{
		document.getElementById('star' + x).innerHTML = '<i class="fa fa-star-o"></i>';
	}

}



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Vendor filter modal

$(document).ready(function() {

    $("#filter_vendors").click(function() {
        $("#filter_modal").parent().show();
    })

    $("#filter_vendors_submit").click(function() {
        var checked = $("#filter_modal").find("input:checked");
        // When none checked, we turn off the filter
        if (checked.length < 1) {
            $(".convention_vendor").show();
        } else {
            $(".convention_vendor").hide();
            for (var i = 0; i < checked.length; i++ ){
                var tagClass = checked[i].value
                $("."+tagClass).show();
            }
        }
        $("#filter_modal").parent().hide();
        return false;
    })

})