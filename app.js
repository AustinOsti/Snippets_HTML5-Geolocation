// Elements that we will need to manipulate
var InputElements = document.getElementById("MountainClimberTrackerInputElements");
var locationError = document.getElementById("Error");
var resultsTitle = document.getElementById("TrackingTitle");
var resultsContent = document.getElementById("TrackingResults");
var googleMap = document.getElementById("GoogleMap");

// Create a two dimensional array for keeping our store data
var mountainData = new Array(3)
createTwoDimensionalArray(3);

// Variable to track the selected mountain index in our array
var mountainDataIndex = 0;

// Variable to track position watch ID
var watchPositionId = 0;

// Mountain information
mountainData[0][0] = "Dafarm Hotel";
mountainData[1][0] = "Spuds Pub";
mountainData[2][0] = "Choices Pub";

// Mountain latitude
mountainData[0][1] = "39.1178512";
mountainData[1][1] = "35.7649612";
mountainData[2][1] = "46.8529129";

// Mountain longitude
mountainData[0][2] = "-106.4451599";
mountainData[1][2] = "-82.26511";
mountainData[2][2] = "-121.7604446";

// This function creates our two dimensional array
function createTwoDimensionalArray(arraySize) {
	for (i = 0; i < mountainData.length; ++i)
	mountainData[i] = new Array(arraySize);
}

// Function to determine if browser supports geolocation
function checkGeolocationSupport() {
		if (navigator.geolocation) {
		// Show mountain selection options - radio buttons -
		// otherwise send to function that shows the specific reason why location cannot be determined
		InputElements.style.display = 'block';
		locationError.style.display = 'none';
		resultsTitle.style.display = 'none';
		resultsContent.style.display = 'none';
		googleMap.style.display = 'none';
	}
	else {
		// Browser does not support geolocation
		InputElements.style.display = 'none';
		locationError.style.display = 'block';
		locationError.innerHTML = '<em>We cannot show your location because your browser does not support HTML 5 geolocation.</em>';
		resultsTitle.style.display = 'none';
		resultsContent.style.display = 'none';
		googleMap.style.display = 'none';
	}
}

function startTracking(mountainIndex) {
	// Set index tracking variable to selected mountain data array index
	mountainDataIndex = mountainIndex;
	// Clear position watch
	navigator.geolocation.clearWatch(watchPositionId);
	// Start watching location
	watchPositionId = navigator.geolocation.watchPosition(showClimberLocation, showError, { enableHighAccuracy: false, maximumAge: 60000, timeout: 30000 });
}

// Hide/show appropriate elements
function showClimberLocation(position) {
	InputElements.style.display = 'block';
	locationError.style.display = 'none';
	resultsTitle.style.display = 'block';
	resultsContent.style.display = 'block';
	googleMap.style.display = 'block';
	// Determine current distance to mountain
	var currentDistance;
	currentDistance = calculateDistance(position.coords.latitude, position.coords.longitude, mountainData[mountainDataIndex][1], mountainData[mountainDataIndex][2]);
	var timestampDate = new Date(position.timestamp);
	// Build results
	var geoloactionResults = '';
	geoloactionResults = '<strong>' + mountainData[mountainDataIndex][0] + '</strong><br />&nbsp;Distance to peak (miles): ' + Math.round(currentDistance * 10) / 10 + '<br />';
	geoloactionResults = geoloactionResults + '&nbsp;Position (latitude, longitude): ' + position.coords.latitude + ', ' + position.coords.longitude + '<br />';
	geoloactionResults = geoloactionResults + '&nbsp;(position accurate to within ' + Math.round(convertMetersToFeet(position.coords.accuracy)) + ' feet)<br />';

	// Altitude cannot be determined -- generate appropriate message
	if ((position.coords.altitude == null) || ((position.coords.altitude == 0) && (position.coords.altitudeAccuracy == 0))) {
		geoloactionResults = geoloactionResults + '&nbsp;Altitude could not be determined.<br />';
	}
	else {
		// Calculate and display results normally
		geoloactionResults = geoloactionResults + '&nbsp;Current Altitude: ' + position.coords.altitude + '<br />';
		geoloactionResults = geoloactionResults + '&nbsp;(altitude accurate to within ' + Math.round(convertMetersToFeet(position.coords.altitudeAccuracy)) + ' feet)<br />';
	}

	// Heading cannot be determined -- generate appropriate message
	if ((position.coords.heading == null) || (isNaN(position.coords.heading))) {
		geoloactionResults = geoloactionResults + '&nbsp;Heading could not be determined.<br />';
	}
	else {
		// Calculate and display results normally
		geoloactionResults = geoloactionResults + '&nbsp;Heading: ' + position.coords.heading + ' (360 degree heading with North being 0)<br />';
	}

	// Heading cannot be determined -- generate appropriate message
	if ((position.coords.speed == null) || (isNaN(position.coords.speed))) {
		geoloactionResults = geoloactionResults + '&nbsp;Speed could not be determined.<br />';
	}
	else {
		// Calculate and display results normally
		geoloactionResults = geoloactionResults + '&nbsp;Speed: ' + position.coords.speed + convertMetersPerSecondToMilesPerHour(position.coords.speed) + ' (converted from meters per second to miles per hour)<br />';
	}

	// Show results
	geoloactionResults = geoloactionResults + '&nbsp;Last Updated: ' + timestampDate.toLocaleString();

	// Show map
	resultsContent.innerHTML = geoloactionResults;
	var googleLatitudeLongitude = position.coords.latitude + "," + position.coords.longitude;
	var mapImageUrl = "http://maps.googleapis.com/maps/api/staticmap?center=" + googleLatitudeLongitude + "&zoom=12&size=300x300&sensor=false";
	googleMap.innerHTML = "<img src='" + mapImageUrl + "' />";
}

// Calculate distance between mountain peak and current location using the Haversine formula
function calculateDistance(latitude1,longitude1,latitude2,longitude2) {
	var earthRadius = 3961.3; // Radius of the earth in miles
	var dLatitude = convertToRadian(latitude2 - latitude1);
	var dLongitude = convertToRadian(longitude2 - longitude1);
	var a = Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) + Math.cos(convertToRadian(latitude1)) * Math.cos(convertToRadian(latitude2)) * Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2);
	var greatCircleDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var distance = earthRadius * greatCircleDistance; // distance converted to miles from radians
	return distance;
}

// Convert meters to feet and return result
function convertMetersToFeet(meters) {
	var feet;
	feet = meters * 3.2808399;
	return feet;
}

// Convert meters per second to miles per hour
function convertMetersPerSecondToMilesPerHour(mps) {
	var mph;
	feet = mph * 2.2369362920544;
	return mph;
}

// Function to convert degrees to radians
function convertToRadian(numericDegree) {
	return numericDegree * Math.PI / 180;
}

// Handle all error messages and display appropriate elements
function showError(error) {
	// Hide/show appropriate elements
	InputElements.style.display = 'none';
	locationError.style.display = 'block';
	resultsTitle.style.display = 'none';
	resultsContent.style.display = 'none';
	googleMap.style.display = 'none';
	// Determine appropriate eeror message
	switch (error.code) {
		case error.PERMISSION_DENIED:
			locationError.innerHTML = "We tried but we can't calculate your location because you denied the request for Geolocation."
			break;
		case error.POSITION_UNAVAILABLE:
			locationError.innerHTML = "We tried but we can't calculate your location because the location information is unavailable."
			break;
		case error.TIMEOUT:
			locationError.innerHTML = "We tried but we can't calculate your location because the request to get your location timed out."
			break;
		case error.UNKNOWN_ERROR:
			locationError.innerHTML = "We tried but we can't calculate your location because an unknown error occurred."
			break;
	}
}
