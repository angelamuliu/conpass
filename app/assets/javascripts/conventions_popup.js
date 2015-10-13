//Function To Display Popup
function div_show() {
document.getElementById('openHere').style.display = "block";
}
//Function to Hide Popup
function div_hide(){
document.getElementById('openHere').style.display = "none";
}

function alphabetize(){
if(document.getElementById('alphabetical').style.display == "none")
{
	document.getElementById('alphabet').style.fontWeight = 700;
	document.getElementById('alphabet').style.color = "red";
	document.getElementById('chronological').style.display = "none";
	document.getElementById('alphabetical').style.display = "block";
}
else
{
	document.getElementById('alphabet').style.fontWeight = 400;
	document.getElementById('alphabet').style.color = "gray";
	document.getElementById('chronological').style.display = "block";
	document.getElementById('alphabetical').style.display = "none";
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
