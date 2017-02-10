// Google Map Location
var myCenter = new google.maps.LatLng(42.3601, -71.0589);

function initialize() {
    var mapProp = {
        center: myCenter,
        zoom: 12,
        scrollwheel: false,
        draggable: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    var marker = new google.maps.Marker({
        position: myCenter
    });

    marker.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);

// Modal Image Gallery
function onClick(element) {
    document.getElementById("img01").src = element.src;
    document.getElementById("modal01").style.display = "block";
    var captionText = document.getElementById("caption");
    captionText.innerHTML = element.alt;
}


// Toggle between showing and hiding the sidenav when clicking the menu icon
var mySidenav = document.getElementById("wb-side-nav");

function w3_open() {
    if (mySidenav.style.display === 'block') {
        mySidenav.style.display = 'none';
    } else {
        mySidenav.style.display = 'block';
    }
}

// Close the sidenav with the close button
function w3_close() {
    mySidenav.style.display = "none";
}