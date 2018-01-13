// GLOBAL VARIABLES
var map, google, ko;

// MODEL

// Array containing location data
var places = [
  {
    title: 'Baraga State Park',
    LatLng: {
      lat: 46.749297,
      lng: -88.476654
    },
    selected: false,
    image: 'BaragaStatePark.png',
    imageInfo: 'Bishop Baraga Shrine'
  },
  {
    title: 'Copper Harbor, MI',
    LatLng: {
      lat: 47.4694752,
      lng: -87.9133548
    },
    selected: false,
    image: 'CopperHarbor.png',
    imageInfo: 'Copper Harbor, Lake Superior'
  },
  {
    title: 'Grand Marais, MI',
    LatLng: {
      lat: 46.6717881,
      lng: -85.9928782
    },
    selected: false,
    image: 'GrandMarais.png',
    imageInfo: 'Grand Marais, Lake Superior'
  },
  {
    title: 'Hiawatha National Forest',
    LatLng: {
      lat: 46.2325682,
      lng: -86.5103487
    },
    selected: false,
    image: 'HiawathaIndianRiver.png',
    imageInfo: 'Indian River, Hiawatha National Forest'
  },
  {
    title: 'Kitch-iti-kipi',
    LatLng: {
      lat: 46.0041576,
      lng: -86.3906836
    },
    selected: false,
    image: 'BigSpring.png',
    imageInfo: 'Big Spring Shoreline'
  },
  {
    title: "Laughing Whitefish Falls",
    LatLng: {
      lat: 46.3976776,
      lng: -87.062704
    },
    selected: false,
    image: 'LaughingWhitefishFalls.png',
    imageInfo: 'Laughing Whitefish Falls'
  },
  {
    title: 'Mackinac Island',
    LatLng: {
      lat: 45.8657336,
      lng: -84.6444116
    },
    selected: false,
    image: 'Mackinac.png',
    imageInfo: 'Mackinac Island, view from Main Street'
  },
  {
    title: 'Manistique, MI',
    LatLng: {
      lat: 45.9447901,
      lng: -86.2497676
    },
    selected: false,
    image: 'Manistique.png',
    imageInfo: 'Manistique Lighthouse'
  },
  {
    title: 'Marquette, MI',
    LatLng: {
      lat: 46.6101741,
      lng: -87.6294148
    },
    selected: false,
    image: 'Marquette.png',
    imageInfo: 'Marquette, shoreline at Presque Island'
  },
  {
    title: 'Tahquamenon Falls',
    LatLng: {
      lat: 46.6053783,
      lng: -85.204166
    },
    selected: false,
    image: 'TaquamenonFalls.png',
    imageInfo: 'Upper Tahquamenon Falls'
  }
];

var Place = function (data) {

  // Initializing data from places array
  this.title = data.title;
  this.LatLng = data.LatLng;
  this.image = data.image;
  this.imageInfo = data.imageInfo;
};

// VIEW MODEL

var ViewPlaces = function () {
  var self = this;

  /* The following involves the creation of markers and map boundaries for the markers */

  // Global variables for the markers, bounds, and infowindows functions
  var marker, markers = [],
    bounds;

  // Default icon color
  var defaultIcon = makeMarkerIcon('00b3e6');

  // Mouseover/highlighted marker color
  var highlightedIcon = makeMarkerIcon('eceb97');

  // Create marker size and origin relative to position on the map
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
      markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  }

  // Create observable array of model data
  self.placeList = ko.observableArray([]);

  // Push model data into the above array
  places.forEach(function (place) {
    self.placeList.push(new Place(place));
  });

  // Create and add markers to the map. Also animate icon drop and use default icon color
  self.placeList().forEach(function (data) {
    data.marker = new google.maps.Marker({
      map: map,
      position: data.LatLng,
      title: data.title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon
    });

    // Add the markers created in the previous function to an array
    markers.push(data.marker);

    // Add markers to model data
    marker = data.marker;

    // Add bounce animation with timeout to markers when they are clicked
    google.maps.event.addListener(data.marker, 'click', function () {
      if (data.marker.getAnimation() !== null) {
        data.marker.setAnimation(null);
      } else {
        data.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){data.marker.setAnimation(null);
        }, 1400);
      }
    });

    // Rollovers for markers
    marker.addListener('mouseover', function () {
      this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function () {
      this.setIcon(defaultIcon);
    });

    // Create LatLng Bounds
    bounds = new google.maps.LatLngBounds();

    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);

    // Add window resize to make sure markers always fit when the user resizes the map
    google.maps.event.addDomListener(window, 'resize', function() {
      map.fitBounds(bounds);
    });

  });

  /* The following section involves the creation of markers and map boundaries for the markers */

  // Create new largeInfowindow
  var largeInfowindow = new google.maps.InfoWindow();

  // Add infowindows to the map with a placeholder property for content
  function addInfoWindowToMarkers(markers, map) {
    var infowindow = new google.maps.InfoWindow({
      content: 'information'
    });

    // Add a click event to each marker that calls the populated infowindow
    self.placeList().forEach(function (data) {
      var marker = data.marker;
      marker.addListener('click', function () {
        populateInfoWindow(this, data, largeInfowindow);
        //toggleBounce(marker);
      });
    });
  }

  // Call the function that creates the InfoWindows
  addInfoWindowToMarkers();

  // Open the large infowindow on each marker.
  function populateInfoWindow(marker, data, infowindow) {

    // Rename title for use in wikiURL
    var title = marker.title;

    // Request JSON data from Wikipedia for the clicked marker
    var wikiURL =
      'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
      title + '&format=json&callback=wikiCallback';

    // Request jsonp data from Wikipedia
    $.ajax({
      // Ajax settings
      url: wikiURL,
      dataType: "jsonp",

      // If the request is successful, process the data
    }).done(function (response) {

      // Use the 4th returned piece of data for the URL
      var urlList = response[3];

      // Loop through list string to create the Wikipedia link for in infowindow
      for (var i = 0; i < response.length; i++) {
        var wikiLinkUrl = urlList[i];

        // Add the Wikipedia link to the model data
        data.wikiLinkUrl = wikiLinkUrl;

        // Check to make sure that a infowindow is not already opened, then open the infowindow for the marker
        if (infowindow.marker != marker) {
          infowindow.marker = marker;

          // Content for the infowindow
          var infoWindowHTML = '<div>' + marker.title + '<p><a href="' +
            data.wikiLinkUrl + '" title="' + data.imageInfo + '">' +
            'More information from Wikipedia</a><p>' +
            '<img src="images/' + data.image + '" alt="' + data.imageInfo +
            '">' +
            '<p>' + data.imageInfo + '</p></div>';

          // Add the content to the infowindow
          infowindow.setContent(infoWindowHTML);

          // Open the infowindow
          infowindow.open(map, marker);
        }
      }

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function () {
          infowindow.setMarker = null;
      });

    // Alert window if Wikipedia fails to load
    }).fail(function (jqXHR, textStatus) {
      alert("Failed to load Wikipedia page");
    });
    // Close the populateInfoWindow function
  }

  /* The following creates the filter function for the place names and map markers */

  // Create the filter observable
  this.filter = ko.observable('');

  // Create the filteredPlaced computered function
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

  // Call the applyFilter function
  this.applyFilter = function (place) {};

  // Apply click functionality to place names
  ViewPlaces.list = function (data, marker) {
    google.maps.event.trigger(data.marker, 'click');
  };

  // Hide introduction on moble
  $( "button" ).click(function() {
    $( ".introduction" ).toggle();
  });

  // End the ViewModel
};


// GOOGLE MAPS INITIALIZATION

function initMap() {

  // Create a styles array to use with the map
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

  // Create the constructor that initializes the map, centers the location, adds the styles, hides the mapTypeControl and adds the zoom
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 46.188294,
      lng: -86.4655739
    },
    styles: styles,
    mapTypeControl: false,
    zoom: 10
  });

  // Activate the ViewModel
  ko.applyBindings(new ViewPlaces());

  // close initMap function
}

// Function to alert to failure of Google Map load
function mapError () {
  alert("Failed to load Google Maps");
}