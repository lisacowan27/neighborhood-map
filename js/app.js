  /* Knockout here -- used to handle the list, filter and any other information that is subject to changing state -- the Model stuff */

"use strict";

// GLOBAL VARIABLES
var map;


// MODEL
// Array containing location data
var places = [
  {title: 'Baraga State Park', LatLng: {lat: 46.749297, lng: -88.476654}, selected: false, image: 'BaragaStatePark.png', imageInfo: 'Bishop Baraga Shrine'},
  {title: 'Copper Harbor, MI', LatLng: {lat: 47.4694752, lng: -87.9133548}, selected: false, image: 'CopperHarbor.png', imageInfo: 'Copper Harbor, Lake Superior'},
  {title: 'Grand Marais, MI', LatLng: {lat: 46.6717881, lng: -85.9928782}, selected: false, image: 'GrandMarais.png', imageInfo: 'Grand Marais, Lake Superior'},
  {title: 'Hiawatha National Forest', LatLng: {lat: 46.2325682, lng: -86.5103487}, selected: false, image: 'HiawathaIndianRiver.png', imageInfo: 'Indian River, Hiawatha National Forest'},
  {title: 'Kitch-iti-kipi (Big Spring)', LatLng: {lat: 46.0041576, lng: -86.3906836}, selected: false, image: 'BigSpring.png', imageInfo: 'Big Spring Shoreline'},
  {title: "Laughing Whitefish Falls", LatLng: {lat: 46.3976776, lng: -87.062704}, selected: false, image: 'LaughingWhitefishFalls.png', imageInfo: 'Laughing Whitefish Falls'},
  {title: 'Mackinac Island', LatLng: {lat: 45.8657336, lng: -84.6444116}, selected: false, image: 'Mackinac.png', imageInfo: 'Mackinac Island, view from Main Street'},
  {title: 'Manistique, MI', LatLng: {lat: 45.9447901, lng: -86.2497676}, selected: false, image: 'Manistique.png', imageInfo: 'Manistique Lighthouse'},
  {title: 'Marquette, MI', LatLng: {lat: 46.6101741, lng: -87.6294148}, selected: false, image: 'Marquette.png', imageInfo: 'Marquette, shoreline at Presque Island'},
  {title: 'Tahquamenon Falls', LatLng: {lat: 46.6053783, lng: -85.204166}, selected: false, image: 'TaquamenonFalls.png', imageInfo: 'Upper Tahquamenon Falls'}
];

var Place = function (data) {

    // Initializing data from places array
    this.title = data.title;
    this.LatLng = data.LatLng;
    this.image = ko.observable(data.image);
    this.imageInfo = ko.observable(data.imageInfo);
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

    console.log(self.placeList()); // works

  // Add markers to the map
  self.placeList().forEach(function(data) {
      data.marker = new google.maps.Marker({
        map: map,
        position: data.LatLng,
        title: data.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
      });

    //console.log('placeList after markers ' + places);

    // Add the markers created in the previous function to an array
    markers.push(data.marker);
    //console.log('markers here ' + markers);

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
        console.log('place list 126 ' + self.placeList()); // works
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

    var wikiURL, articleUrl, articleList, articleStr, replacedTitle;

    replacedTitle = marker.title;
    replacedTitle = encodeURIComponent(replacedTitle.trim());

    //cssClass = self.css;
    //console.log(cssClass + ' cssClass');

    self.placeList().forEach(function(data) {

    wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + replacedTitle + '&format=json&callback=wikiCallback';


    //timeout for wikipedia page if it takes more than 8 seconds
        var wikiTimeout = setTimeout(function () {
            alert("failed to load wikipedia page");
        }, 8000);

         //ajax requst
        $.ajax({
            url: wikiURL,
            dataType: "jsonp",

            //jsonp datatype
        }).done(function(response) {

            var articleList = response[0];

            console.log('articleList ' + articleList);

            for (var i = 0; i < articleList.length; i++) {
              articleStr = articleList[i];
              var articleUrl = 'http://en.wikipedia.org/wiki/' + replacedTitle;

              data.articleUrl = articleUrl;

              //console.log(url);
              if (infowindow.marker != marker) {
                    infowindow.marker = marker;
                    console.log('infowindow marker ' + infowindow.marker);

                    var infoWindowHTML = '<div id="info-window"' +
                    'data-bind="template: {name: \'info-window-template\'">' +
                    marker.title + '<p><a data-bind="attr: { href: articleUrl, title: imageInfo }">' +
                    'More information from Wikipedia</a><p>' +
                    '<img data-bind="att: {src: image}">' +
                    '<p data-bind={text: imageInfo}></p>'
                    '</div>'

                    infowindow.setContent(infoWindowHTML);

                    infowindow.open(map, marker);
                  // Make sure the marker property is cleared if the infowindow is closed.
                  infowindow.addListener('closeclick',function(){
                    infowindow.setMarker = null;
                  });
                }
          }
            //timeout is cleared if wikipedia link is loaded successfully
            clearTimeout(wikiTimeout);
            //response from wikipedia api
            //articleUrl = response[1];
        });

      // Check to make sure the infowindow is not already opened on this marker.
    });

  }

    // The following creates the filter function for the place names and map markers

   this.filter = ko.observable('');

    this.filteredPlaces = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      self.placeList().forEach(function(data) {
        //console.log('data marker ' + data.marker);
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

    this.applyFilter = function (place) {
        console.log ('this is this place name + ' );
    };

    ViewPlaces.list = function(data, marker) {
    google.maps.event.trigger(data.marker, 'click');
  };



}; // end VM


//Function to load map and start up app
// Load  Google Map:   map = new google.maps.Map(document.getElementById('map') etc.
// Instantiate ViewModel:   ko.applyBindings(new ViewModel());
/* Maps API here -- used for creating markers, tracking click events on markers, making the map and refreshing the map. -- API stuff */


//var placeMarkers = [];

function initMap() {
    // Create a styles array to use with the map.
    var styles = [
    {
        featureType: "administrative",
        elementType: "labels.text.fill",
        stylers: [
            {
                color: "#6195a0"
            }
        ]
    },
    {
        featureType: "landscape",
        elementType: "all",
        stylers: [
            {
                color: "#f2f2f2"
            }
        ]
    },
    {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#ffffff"
            }
        ]
    },
    {
        featureType: "poi",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "poi.park",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#e6f3d6"
            },
            {
                visibility: "on"
            }
        ]
    },
    {
        featureType: "road",
        elementType: "all",
        stylers: [
            {
                saturation: -100
            },
            {
                lightness: 45
            },
            {
                visibility: "simplified"
            }
        ]
    },
    {
        featureType: "road.highway",
        elementType: "all",
        stylers: [
            {
                visibility: "simplified"
            }
        ]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#f4d2c5"
            },
            {
                visibility: "simplified"
            }
        ]
    },
    {
        featureType: "road.highway",
        elementType: "labels.text",
        stylers: [
            {
                color: "#4e4e4e"
            }
        ]
    },
    {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#f4f4f4"
            }
        ]
    },
    {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [
            {
                color: "#787878"
            }
        ]
    },
    {
        featureType: "road.arterial",
        elementType: "labels.icon",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "transit",
        elementType: "all",
        stylers: [
            {
                visibility: "off"
            }
        ]
    },
    {
        featureType: "water",
        elementType: "all",
        stylers: [
            {
                color: "#eaf6f8"
            },
            {
                visibility: "on"
            }
        ]
    },
    {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#eaf6f8"
            }
        ]
    }
];

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 46.188294, lng: -86.4655739},
      styles: styles,
      mapTypeControl: false,
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