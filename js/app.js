  /* Knockout here -- used to handle the list, filter and any other information that is subject to changing state -- the Model stuff */

"use strict";

// GLOBAL VARIABLES
var map;


// MODEL
// Array containing location data
var places = [
  {title: 'Baraga State Park', LatLng: {lat: 46.749297, lng: -88.476654}, selected: false},
  {title: 'Copper Harbor, MI', LatLng: {lat: 47.4694752, lng: -87.9133548}, selected: false},
  {title: 'Grand Marais, MI', LatLng: {lat: 46.6717881, lng: -85.9928782}, selected: false},
  {title: 'Hiawatha National Forest', LatLng: {lat: 46.2325682, lng: -86.5103487}, selected: false},
  {title: 'Kitch-iti-kipi (Big Spring)', LatLng: {lat: 46.0041576, lng: -86.3906836}, selected: false},
  {title: "Laughing Whitefish Falls", LatLng: {lat: 46.3976776, lng: -87.062704}, selected: false},
  {title: 'Mackinac Island', LatLng: {lat: 45.8657336, lng: -84.6444116}, selected: false},
  {title: 'Manistique, MI', LatLng: {lat: 45.9447901, lng: -86.2497676}, selected: false},
  {title: 'Marquette, MI', LatLng: {lat: 46.6101741, lng: -87.6294148}, selected: false},
  {title: 'Tahquamenon Falls', LatLng: {lat: 46.6053783, lng: -85.204166}, selected: false}
];

var Place = function (data) {

    // Initializing data from places array
    this.title = data.title;
    this.LatLng = data.LatLng;
    this.selected = ko.observable(data.selected);
    //this.marker = data.marker;
};

//VIEW MODEL
// functions to add markers, show data, filter locations, update infowindow content etc.
// Run API calls to get data
/* Creating markers as part of your VM is recommended, but the cannot be knockout observables.*/

var ViewPlaces = function() {
  var self = this;

  var marker, markers = [], bounds;

  var largeInfowindow = new google.maps.InfoWindow();


  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('00b3e6');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('eceb97');

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  self.placeList = ko.observableArray([]);

  places.forEach(function(place){
      self.placeList.push( new Place(place) );
  });

  // Add markers to the map
  self.placeList().forEach(function(data) {
      data.marker = new google.maps.Marker({
        map: map,
        position: data.LatLng,
        title: data.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
      });

    console.log('placeList after markers ' + places);

    // Add the markers created in the previous function to an array
    markers.push(data.marker);
    console.log('markers here ' + markers);

    marker = data.marker;

    // Rollovers for markers
    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

    // Loop through the markers array and display them all within the boundaries of the map
    bounds = new google.maps.LatLngBounds();

    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }

    map.fitBounds(bounds);

  });

  console.log(self.placeList()); // works

  // Create Google Maps InfoWindows
  function addInfoWindowToMarkers(markers, map) {
      var infowindow = new google.maps.InfoWindow({
        content: 'information'
      });

      // Add and InfoWindow for each marker on the map
      self.placeList().forEach(function(data) {
        var marker = data.marker;
        marker.addListener('click', function() {
          //console.log('this is ' + this);
          //console.log('click');
          populateInfoWindow(this, largeInfowindow);
      });
    });
  }

  // Call the function that creates the InfoWindows
  addInfoWindowToMarkers();

  // Open the large infowindow at each marker.
  function populateInfoWindow(marker, infowindow) {

    var articleUrl;
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    console.log('marker url ' + wikiURL);
    //timeout for wikipedia page if it takes more than 8 seconds
        var wikiTimeout = setTimeout(function () {
            alert("failed to load wikipedia page");
        }, 8000);

         //ajax requst
        $.ajax({
            url: wikiURL,
            dataType: "jsonp"
            //jsnop datatype
        }).done(function(response) {
            //timeout is cleared if wikipedia link is loaded successfully
            clearTimeout(wikiTimeout);
            //response from wikipedia api
            articleUrl = response[3][0];
        });

      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div><br><a href ="' + articleUrl + '">' + articleUrl + '</a>');
          infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick',function(){
          infowindow.setMarker = null;
        });
      }
    }


    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    /*self.allMarkers().forEach(function(marker) {
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
    });*/

    /*self.allMarkers().forEach(function(marker) {
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    });*/

    //console.log('marker array' + allMarkers);

    // The following creates the filter function for the place names and map markers

    this.filter = ko.observable('');

    this.filteredPlaces = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      self.placeList().forEach(function(data) {
        console.log('data marker ' + data.marker);
                if (data.marker) {
                    data.marker.setVisible(true);
                }
            });
            return self.placeList();
    } else {
        return ko.utils.arrayFilter(self.placeList(), function(data) {
            if (data.title.toLowerCase().indexOf(filter) > -1) {
                data.marker.setVisible(true);
                return true;
            } else {
                data.marker.setVisible(false);
                return false;
            }
        });
      }
    }, self);


  /*     // Listen for the event fired when the user selects a prediction and clicks
        // "go" more details for that place.
        //document.getElementById('go-places').addEventListener('click', textSearchPlaces);

        // This function will loop through the listings and hide them all.
      function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }

    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
            infowindow.setMarker = null;
          });
        }
      }*/

    this.applyFilter = function (place) {
        console.log ('this is this place name + ' );
    };

}; // end VM


//Function to load map and start up app
// Load  Google Map:   map = new google.maps.Map(document.getElementById('map') etc.
// Instantiate ViewModel:   ko.applyBindings(new ViewModel());
/* Maps API here -- used for creating markers, tracking click events on markers, making the map and refreshing the map. -- API stuff */


//var placeMarkers = [];

function initMap() {
    // Create a styles array to use with the map.

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 46.188294, lng: -86.4655739},
      //styles: styles,
      zoom: 10
    });

    var bounds = new google.maps.LatLngBounds();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('00b3e6');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('eceb97');

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

    //To Activate Knockout through app.js
    ko.applyBindings(new ViewPlaces());

} // close initMap function