var username = "";
var appointments;
var categories;
var filter = 0;
//var host = "//dhbw.t-battermann.de/calendar/redirect.php";
var host = "http://host.bisswanger.com/dhbw/calendar.php";

function showAlert( type, info, text ) {
	div = document.createElement("div");
	if ( type != "success" && type != "info" && type != "warning" && type != "danger")
		type = "info";
	div.className = "alert alert-" + type + " alert-dismissible";
	div.innerHTML = '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
	str = document.createElement("strong");
	str.appendChild(document.createTextNode( info + " " ));
	div.appendChild(str);
	div.appendChild(document.createTextNode( text ));
	e = document.getElementById("right");
	e.insertBefore( div, e.firstChild );
}

function getListItems() {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		getListItemOnReadyStatusChangeEventHandler( request, filter );
	};
	request.open("GET", host + "?user="+username+"&format=json&action=list");
	request.send();
}
function showCategory( id ) {
	filter = id;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		getListItemOnReadyStatusChangeEventHandler( request, id );
	};
	request.open("GET", host + "?user="+username+"&format=json&action=list");
	request.send();
}
function prettyDate(from, to, allday) {
	var r = /(\d{4})-(\d{2})-0?([1-3]?\d)T(\d{2}):(\d{2})/;
	var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var mf = r.exec(from);
	var mt = r.exec(to);
	if ( mf[1] == mt[1] && mf[2] == mt[2] && mf[3] == mt[3] ) {
		if ( allday )
			return month[mf[2]-1] + " " + mf[3] + ", " + mf[1];
		return month[mf[2]-1] + " " + mf[3] + ", " + mf[1] + " " + mf[4] + ":" + mf[5] + " - " + mt[4] + ":" + mt[5];
	}
	if ( allday )
		return month[mf[2]-1] + " " + mf[3] + ", " + mf[1] + " - " +
		       month[mt[2]-1] + " " + mt[3] + ", " + mt[1];
	return month[mf[2]-1] + " " + mf[3] + ", " + mf[1] + " " + mf[4] + ":" + mf[5] + " - " +
	       month[mt[2]-1] + " " + mt[3] + ", " + mt[1] + " " + mt[4] + ":" + mt[5];
}
function hasCategory(appointment, id) {
	for(var i = 0; i<appointment.categories.length; i++)
		if (appointment.categories[i].id == id)
			return true;
	return false;
}
function getListItemOnReadyStatusChangeEventHandler( request, id ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var header = document.createElement("h2");
		header.appendChild(document.createTextNode("Agenda"));
		document.getElementById("content").innerHTML = "";
		document.getElementById("content").appendChild(header);
		var c = eval('(' + request.responseText + ')');
		appointments = c["events"]["events"];
		appointments = appointments.sort( function (a,b) {return a.start > b.start ? 1 : (a.start == b.start ? 0 : -1)});
		var past = document.getElementById("showPastAppointments").checked;
		if (!past || id != 0) {
			var app = [];
			var d = new Date();
			d = d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)+"T"+d.getHours()+":"+d.getMinutes();
			for(var i=0;i<appointments.length;i++) {
				if ( (past || appointments[i].end > d) && (id == 0 || hasCategory(appointments[i], id)) ) {
					app.push(appointments[i]);
				}
			}
			appointments = app;
		}
		if(appointments.length == 0) {
			e = document.createElement("p");
			e.appendChild(document.createTextNode("There are no entries to display!"));
			document.getElementById("content").appendChild(e);
			return;
		}
		for(var i=0;i<appointments.length;i++) {
			calendarElement = document.createElement("div");
			switch( appointments[i].status ) {
				case "Free":
					calendarElement.className = "panel panel-success";
					break;
				case "Busy":
					calendarElement.className = "panel panel-danger";
					break;
				default:
					calendarElement.className = "panel panel-warning";
			}
			calendarElement.setAttribute("id", "a-" + appointments[i].id);
			// title
			title = document.createElement("div");
			title.className = "panel-heading";
			title2 = document.createElement("h3");
			title2.className = "panel-title";
			title2.appendChild(document.createTextNode(appointments[i].title));
			title.appendChild(title2);
			calendarElement.appendChild(title);

			body = document.createElement("div");
			body.className = "panel-body";
			calendarElement.appendChild(body);
			
			// image
			if (appointments[i].imageurl.length > 12) {
				media = document.createElement("div");
				media.className = "media";
				ml = document.createElement("div");
				ml.className = "media-right";
				img_a = document.createElement("a");
				img_a.href = appointments[i].imageurl;
				img_a.setAttribute("id","img-" + appointments[i].id);
				img_a.setAttribute("target", "_blank");
				img = document.createElement("img");
				img.src = appointments[i].imageurl;
				img.alt = "Image #" + appointments[i].id;
				img_a.setAttribute("class", "small");
				img_a.appendChild(img);
				ml.appendChild(img_a);
				body.appendChild(media);
				body = document.createElement("div");
				body.className = "media-body";
				media.appendChild(body);
				media.appendChild(ml);
			}
			// if there are any categories change "body"
			elem = body;
			if (appointments[i].categories.length > 0) {
				elem = document.createElement("div");
				elem.className = "row";
				body.appendChild(elem);
				body = elem;
				elem = document.createElement("div");
				elem.className = "col-xs-6";
				body.appendChild(elem);
			}
			// info
			info = document.createElement("ul");
			// date
			date = document.createElement("li");
			date.appendChild(document.createTextNode( prettyDate( appointments[i].start, appointments[i].end, appointments[i].allday == 1) ));
			date.className = "date";
			info.appendChild(date);
			// location
			loc = document.createElement("li");
			loc.appendChild(document.createTextNode(appointments[i].location));
			loc.className = "loc";
			info.appendChild(loc);
			// organizer
			org = document.createElement("li");
			link = document.createElement("a");
			link.href = "mailto:" + appointments[i].organizer;
			link.appendChild(document.createTextNode(appointments[i].organizer));
			org.appendChild(link);
			org.className = "org";
			info.appendChild(org);
			// url
			url = /https?:\/\/.{4}/;
			if ( url.exec(appointments[i].webpage) != null ) {
				urli = document.createElement("li");
				url = document.createElement("a");
				url.appendChild(document.createTextNode(appointments[i].webpage));
				url.href = appointments[i].webpage;
				urli.className = "url";
				urli.appendChild(url);
				info.appendChild(urli);
			}
			// actions
			action  = document.createElement("li");
			action.className = "action";
			// edit document
			edit_a   = document.createElement("a");
			edit_img = document.createElement("img");
			edit_img.src = "images/edit.png";
			edit_img.alt = "edit";
			edit_a.href = "#edit-" + appointments[i].id;
			edit_a.setAttribute("onclick", "loadEditForm(" + appointments[i].id + ")");
			edit_a.appendChild(edit_img);
			action.appendChild(edit_a);
			// delete appointment
			del_a   = document.createElement("a");
			del_img = document.createElement("img");
			del_img.src = "images/delete.png";
			del_img.alt = "delete";
			del_a.href = "#delete-" + appointments[i].id;
			del_a.setAttribute("onclick", "deleteAppointment(" + appointments[i].id + ")");
			del_a.appendChild(del_img);
			action.appendChild(del_a);
			// add image
			img_a   = document.createElement("a");
			img_img = document.createElement("img");
			img_img.src = "images/add-image.png";
			img_img.alt = "add/change image";
			img_a.href = "#image-" + appointments[i].id;
			img_a.setAttribute("onclick", "showUploadImageForm(" + appointments[i].id + ")");
			img_a.appendChild(img_img);
			action.appendChild(img_a);
			// add category
			cat_a   = document.createElement("a");
			cat_img = document.createElement("img");
			cat_img.src = "images/folder-txt.png";
			cat_img.alt = "add category";
			cat_a.href = "#add-category-" + appointments[i].id;
			cat_a.setAttribute("onclick", "showAddCategoryForm(" + appointments[i].id + ")");
			cat_a.appendChild(cat_img);
			action.appendChild(cat_a);
			// append actions
			info.appendChild(action);
			// add elements
			elem.appendChild(info);
			// categories
			if ( appointments[i].categories.length != 0 ) {
			body.appendChild(elem);
				cat = document.createElement("div");
				cat.className = "col-xs-6";
				cat.appendChild(document.createTextNode("Categories:"));
				cat2 = document.createElement("ul");
				cat2.setAttribute("id", "cat-" + appointments[i].id);
				cat2.className = "categories";
				for(var j=0; j < appointments[i].categories.length; j++) {
					dca = document.createElement("a");
					dca.href = "#remove-category-" + appointments[i].categories[j].id + "-from-" + appointments[i].id;
					dca.setAttribute("onclick", "deleteCategoryFromEvent( " + appointments[i].id + ", " + appointments[i].categories[j].id + ")");
					dcimg = document.createElement("img");
					dcimg.src = "images/delete.png";
					dcimg.alt = "remove category from event";
					dca.appendChild(dcimg);
					cat3 = document.createElement("li");
					cat3.setAttribute("id", "cat-" + appointments[i].id + "-" + appointments[i].categories[j].id);
					cat3.appendChild(document.createTextNode(appointments[i].categories[j].name));
					cat3.appendChild(dca);
					cat2.appendChild(cat3);
				}
				cat.appendChild(cat2);
				body.appendChild(cat);
			}
			// add appointment to list
			document.getElementById("content").appendChild(calendarElement);
		}
	}
}
function createNewCategory() {
	var name = document.getElementById("createCategory")["name"].value;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	   createNewCategoryOnReadyStatusChangeEventHandler( request );
	};
	request.open("POST", host + "?user="+username+"&format=json&action=add-category&name="+name);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send("name="+encodeURIComponent(name));
}
function createNewCategoryOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error != 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getCategories();
		}
	}
}
function getCategories() {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		getCategoriesOnReadyStatusChangeEventHandler( request );
	};
	request.open("GET", host + "?user="+username+"&format=json&action=list-categories");
	request.send();
}
function getCategoriesOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		var cats = c["categories"]["categories"];
		categories = cats;
		var p = document.getElementById("categoryList");
		p.innerHTML = "";
		for(var i=0;i<cats.length;i++) {
			img = document.createElement("img");
			img.src = "images/folder.png";
			img.alt = "category";
			cl  = document.createElement("a");
			cl.className = "list-group-item";
			cl.href=  "javascript:showCategory(" + cats[i].id + ")";
			cl.appendChild(img);
			cl.appendChild(document.createTextNode( cats[i].name ));
			cd  = document.createElement("a");
			cd.href = "#delete-cat-" + cats[i].id;
			cd.setAttribute("onclick", "deleteCategory(" + cats[i].id + ")");
			ci  = document.createElement("img");
			ci.src = "images/delete.png";
			ci.alt = "delete";
			cd.appendChild(ci);
			cl.appendChild(cd);
			p.appendChild(cl);
		}
	}
}
function deleteCategory( id ) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		deleteCategoryOnReadyStatusChangeEventHandler( request );
	};
	request.open("GET", host + "?user="+username+"&format=json&action=delete-category&id=" + encodeURIComponent(id) );
	request.send();
}
function deleteCategoryOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error != 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getCategories();
			getListItems();
		}
	}
}
function showCreateNewEntry() {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		showCreateNewEntryOnReadyStatusChangeEventHandler( request );
	};
	request.open("GET", "formAppointment.html" );
	request.send();
}
function showCreateNewEntryOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		document.getElementById("content").innerHTML = request.responseText;
	}
}
function createNewEntry() {
	var f = document.getElementById("calendar-entry");
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		createNewEntryOnReadyStatusChangeEventHandler( request );
	};
	request.open("POST", host + "?user="+username+"&format=json&action=add" );
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var allday = f["allday"].checked;
	request.send(
			"title=" + encodeURIComponent(f["title"].value) + "&" + 
			"location=" + encodeURIComponent(f["location"].value) + "&" +
			"organizer=" + encodeURIComponent(f["organizer"].value) + "&" +
			"start=" + encodeURIComponent(f["begin-date"].value + "T" + (allday ? "00:00" : f["begin-time"].value)) + "&" +
			"end=" + encodeURIComponent(f["end-date"].value + "T" + (allday ? "23:59" : f["end-time"].value)) + "&" +
			"status=" + encodeURIComponent(f["status"].value) + "&"+
			"allday=" + (allday ? "1" : "0") + "&" +
			"webpage=" + encodeURIComponent(f["webpage"].value)
			);
}
function createNewEntryOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getListItems();
			showAlert( "success", "Success!", "The entry was successfully created" );
		}
	}
}
function loadEditForm( id ) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		loadEditFormOnReadyStatusChangeEventHandler( id, request );
	};
	request.open("GET", "formAppointment.html" );
	request.send();
}
function loadEditFormOnReadyStatusChangeEventHandler( id, request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		document.getElementById("content").innerHTML = request.responseText;
		document.getElementById("header").innerHTML = "Edit appointment";
		appointment = null;
		for(var i=0; i<appointments.length; i++){
			if (appointments[i].id == id) {
				appointment = appointments[i];
				break;
			}
		}
		if (appointment == null) {
			showAlert( "warning", "Warning!", "Appointment not found" );
			return;
		}
		var f = document.getElementById("calendar-entry");
		f["title"].value = appointment.title;
		f["location"].value = appointment.location;
		f["organizer"].value = appointment.organizer;
		f["begin-date"].value = appointment.start.split("T")[0];
		f["begin-time"].value = appointment.start.split("T")[1];
		f["end-date"].value = appointment.end.split("T")[0];
		f["end-time"].value = appointment.end.split("T")[1];
		f["status"].value = appointment.status;
		f["allday"].checked = appointment.allday == 1;
		f["webpage"].value = appointment.webpage;
		f.setAttribute("action","javascript:updateAppointment("+id+")");
	}
}
function updateAppointment( id ) {
	var f = document.getElementById("calendar-entry");
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		updateAppointmentOnReadyStatusChangeEventHandler( request );
	};
	request.open("POST", host + "?user="+username+"&format=json&action=update" );
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var allday = f["allday"].checked;
	request.send(
			"id=" + encodeURIComponent( id ) + "&" +
			"title=" + encodeURIComponent(f["title"].value) + "&" + 
			"location=" + encodeURIComponent(f["location"].value) + "&" +
			"organizer=" + encodeURIComponent(f["organizer"].value) + "&" +
			"start=" + encodeURIComponent(f["begin-date"].value + "T" + (allday ? "00:00" : f["begin-time"].value)) + "&" +
			"end=" + encodeURIComponent(f["end-date"].value + "T" + (allday ? "23:59" : f["end-time"].value)) + "&" +
			"status=" + encodeURIComponent(f["status"].value) + "&"+
			"allday=" + (allday ? "1" : "0") + "&" +
			"webpage=" + encodeURIComponent(f["webpage"].value)
			);
}
function updateAppointmentOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getListItems();
			showAlert( "success", "Success!", "The entry was successfully updated" );
		}
	}
}
function deleteAppointment( id ) {
	if (confirm("Really delete this appointment?")) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			deleteAppointmentOnReadyStatusChangeEventHandler( request );
		};
		request.open("GET", host + "?user="+username+"&format=json&action=delete&id=" + encodeURIComponent(id) );
		request.send();
	}
}
function deleteAppointmentOnReadyStatusChangeEventHandler( request ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getListItems();
			showAlert( "success", "Success!", "The entry was successfully deleted" );
		}
	}
}
function showUploadImageForm( id ) {
	var elem = document.getElementById("imf-" + id);
	if (elem != null) {
		elem.parentElement.removeChild(elem);
		return;
	}
	elem = document.createElement("div");
	elem.setAttribute("id", "imf-" + id);
	elem.className = "panel panel-info mar";
	document.getElementById("a-" + id).appendChild( elem );
	// load form
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		showUploadImageFormOnReadyStatusChangeEventHandler( request, id );
	};
	request.open("GET", "formImage.html");
	request.send();
}
function showUploadImageFormOnReadyStatusChangeEventHandler( request, id ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		document.getElementById("imf-" + id).innerHTML = request.responseText.replace(/##id##/g, id);
	}
}
function uploadImage( id ) {
	if (document.getElementById("delete-" + id) != null && document.getElementById("delete-" + id).checked ) {
		deleteImage( id );
		return;
	}
	var f = document.getElementById("appointment-" + id);
	if (f["image"].files[0].type != "image/jpeg" && f["image"].files[0].type != "image/png") {
		showAlert( "danger", "Wrong type!", "Images must be of type JPEG or PNG" );
		return;
	}
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		uploadImageOnReadyStatusChangeEventHandler( request );
	};
	request.open("POST", host + "?user="+username+"&format=json&action=upload-image&id=" + id );
	//request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var formData = new FormData();
	formData.append("file", f["image"].files[0]);
	request.send(formData);
}
function uploadImageOnReadyStatusChangeEventHandler( request, id ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getListItems();
			showAlert( "success", "Success!", "The image was successfully saved" );
		}
	}
}
function deleteImage( id ) {
	if (document.getElementById("appointment-" + id) != null) {
		if (confirm("Really delete this image?")) {
			var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				deleteImageOnReadyStatusChangeEventHandler( request, id );
			};
			request.open("GET", host + "?user="+username+"&format=json&action=delete-image&id=" + encodeURIComponent(id) );
			request.send();
		}
	}
}
function deleteImageOnReadyStatusChangeEventHandler( request, id ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			elem = document.getElementById("img-" + id);
			elem.parentElement.removeChild(elem);
			elem = document.getElementById("imf-" + id);
			elem.parentElement.removeChild(elem);
			showAlert( "success", "Success!", "The image was successfully deleted" );
		}
	}
}
function showAddCategoryForm( id ) {
	var elem = document.getElementById("imc-" + id);
	if (elem != null) {
		elem.parentElement.removeChild(elem);
		return;
	}
	elem = document.createElement("div");
	elem.setAttribute("id", "imc-" + id);
	elem.className = "panel panel-info mar";
	document.getElementById("a-" + id).appendChild( elem );
	// load form
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		showAddCategoryFormOnReadyStatusChangeEventHandler( request, id );
	};
	request.open("GET", "formCategories.html");
	request.send();
}
function showAddCategoryFormOnReadyStatusChangeEventHandler( request, id ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		document.getElementById("imc-" + id).innerHTML = request.responseText.replace(/##id##/g, id);
		sel = document.getElementById("category-" + id);
		for(var i=0; i<categories.length; i++) {
			o = document.createElement("option");
			o.value = categories[i].id;
			o.appendChild(document.createTextNode(categories[i].name));
			sel.appendChild(o);
		}
	}
}
function addCategory( id ) {
	f = document.getElementById("categories-" + id);

	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		addCategoryOnReadyStatusChangeEventHandler( request, id );
	};
	request.open("GET", host + "?user="+username+"&format=json&action=put-category&event=" + id + "&category=" + f["category"].value );
	request.send();
}
function addCategoryOnReadyStatusChangeEventHandler( request, id ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			getListItems();
			showAlert( "success", "Success!", "The category was successfully created" );
		}
	}
}

function deleteCategoryFromEvent( eventId, categoryId ) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		deleteCategoryFromEventOnReadyStatusChangeEventHandler( request, eventId, categoryId );
	};
	request.open("GET", host + "?user="+username+"&format=json&action=remove-category&event=" + eventId + "&category=" + categoryId );
	request.send();
}
function deleteCategoryFromEventOnReadyStatusChangeEventHandler( request, eventId, categoryId ) {
	if( request.readyState == 4 && (request.status == 200 || request.status == 0) ) {
		var c = eval('(' + request.responseText + ')');
		if (typeof c.error !== 'undefined') {
			showAlert( "danger", "Error!", c.error.text );
		}else{
			elem = document.getElementById( "cat-" + eventId + "-" + categoryId );
			elem.parentElement.removeChild(elem);
		}
	}
}
function getCookie(name) {
	var cname = name + "=";
	var cookies = document.cookie.split(';');
	for(var i=0;i<cookies.length; i++) {
		var cookie = cookies[i];
		while(cookie.charAt(0) == ' ')
			cookie = cookie.substring(1);
		if(cookie.indexOf(cname) == 0)
			return cookie.substring(cname.length, cookie.length);
	}
	return "";
}
function setCookie(name, value) {
	var d = new Date();
	d.setTime( d.getTime() + 31536000000 );
	document.cookie = name + "=" + value + "; expires=" + d.toUTCString();
}
function logout() {
	var d = new Date();
	d.setTime( d.getTime() - 86400000 );
	document.cookie = "username=; expires=" + d.toUTCString();
	location.reload();
}
function login() {
	r = /[a-zA-Z0-9_ äöüÄÖÜß-]{1,10}/;
	if (!r.exec(username) && !r.exec(getCookie("username")) ) {
		do{
			username = prompt("Please enter your username", "root");
		}while(! r.exec(username) );
	}else{
		if( !r.exec(username) ){
			username = getCookie("username");
		}
	}
	setCookie("username", username);
	document.getElementById("username").innerHTML = username;
}

login();
showCategory(0);
getCategories();

// vim: set ft=javascript shiftwidth=4 noexpandtab eol ff=unix :
