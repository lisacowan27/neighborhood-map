/* Knockout here -- used to handle the list, filter and any other information that is subject to changing state -- the Model stuff */

var locations = [{title: 'Barton Springs', location: {lat: 30.2640024, lng: -97.7709723}},
    {title: 'The Caswell House', location: {lat: 30.2789671, lng: -97.7499303}},
    {title: 'El Arroyo', location: {lat: 30.2749658, lng: -97.7667907}},
    {title: 'Hippie Hollow Park', location: {lat: 30.413155, lng: -97.884064}},
    {title: 'McKinney Falls State Park', location: {lat: 30.1803582, lng: -97.7239284}},
    {title: 'Mt Bonnell', location: {lat: 30.3207599, lng: -97.7908498}},
    {title: "St. Edward\'s Park", location: {lat: 30.4054917, lng: -97.7934439}},
    {title: 'UT Tower', location: {lat: 30.2862394, lng: -97.7445772}},
    {title: 'West Sixth Street Bridge', location: {lat: 30.2730245, lng: -97.7601438}},
    {title: 'Woodlawn (Pease Mansion)', location: {lat: 30.2640901, lng: -97.797237}}
];

var Location = function (data) {

    // Initializing title from locations array
    this.title = ko.observable(data.title);

};


/* Maps API here -- used for creating markers, tracking click events on markers, making the map and refreshing the map. -- API stuff */

var map;

//Create empty variable markers for places of interest
var markers = [];

var placeMarkers = [];

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
      center: {lat: 30.267153, lng: -97.7430608},
      styles: styles,
      mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
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

    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
          bounds.extend(markers[i].position);

          map.fitBounds(bounds);
    }


        // Listen for the event fired when the user selects a prediction and clicks
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
      }

}



/* Tracking click event on *list items* should be handled with KO -- View stuff */




/* Creating markers as part of your VM is recommended, but the cannot be knockout observables.*/

var ViewPlaces = function() {
    // self will always map to the VM
    var self = this;
    var applyFilter;

    this.locationList = ko.observableArray([]);

    // Adding the cat data into the cat array
    locations.forEach(function(locationItem){
        self.locationList.push( new Location(locationItem) );
    });

    this.applyFilter = function (locationItem) {
        console.log ('this is this place name + ' );
    };

   /* this.incrementCounter = function() {
        // this.clickCount is a ko observable
        this.clickCount(this.clickCount() + 1);
    };*/

};

// Apply
ko.applyBindings(new ViewPlaces());