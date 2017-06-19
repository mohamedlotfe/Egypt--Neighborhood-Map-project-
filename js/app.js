 function viewModel(){
    var self = this;
    var map,address;
    var myLocation={};
    self.fourSquareAPI = '';
    self.Location_Arr = ko.observableArray([]);
    //self.markers = ko.observableArray([]);
    var markers = []; 

    var egypt =  new google.maps.LatLng(30.056508, 31.337882);  //center of the map
    var infowindow = new google.maps.InfoWindow();               //pop up window display information
    var service = new google.maps.places.PlacesService(map);
    


    //initilization and loading  our map
    function init() {
      // body...
       map = new google.maps.Map(document.getElementById('map'),{
        center: egypt,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP    
      });

      var request = {
        location: egypt,
        radius: 1000,
        types: ['restaurant']
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);         

      var address,service;
      var list = (document.getElementById('list'));
      var input = (document.getElementById('input'));

      map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(list);
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

      

      var searchBox = new google.maps.places.SearchBox((input));
      var bounds = new google.maps.LatLngBounds();  

      google.maps.event.addListener(searchBox,'places_changed',function () {
        // body...
        var places = searchBox.getPlaces();
        clearMarkers();
        self.Location_Arr.removeAll();
        for(var i = 0; i <= 8; i++){
          if (places[i] !== undefined){
            place = places[i];
            allLocations(place);
            setMarker(place);
            bounds.extend(place.geometry.location);          
          }
        } 
        map.fitBounds(bounds); 
       });
        google.maps.event.addListener(map, 'bounds_changed', function(){
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
          });
  }

  
  //set marks on places     
   function setMarker(place) {
      var img = 'image/22-blue-dot.png';
       var marker = new google.maps.Marker({
        map: map,
        name: place.name,
        position: place.geometry.location,
        place_id: place.place_id,
        animation: google.maps.Animation.DROP,
        icon:img 
      });     
        if (place.vicinity !== undefined) {
        address = place.vicinity;
      } else if (place.formatted_address !== undefined) {
        address = place.formatted_address;
      }       
      var contentString = '<div style="font-weight: 300">' + place.name + '</div><div>' + 
          address + '</div>' + self.fourSquareAPI;

      google.maps.event.addListener(marker, 'click', function() {      
          infowindow.setContent(contentString);      
          infowindow.open(map, this);
          map.panTo(marker.position); 
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){marker.setAnimation(null);
        }, 1300);
        
        });

      markers.push(marker);
      return markers;
  }

  // clears marks based on selecting particular location 
    function clearMarkers() {
      for (var i = 0; i < markers.length; i++ ) {
        if (markers[i]) {
          markers[i].setMap(null);
        }
      }

      // reset markers
      markers = []; 
    } 

  //  To handle results object response
    function callback(results, status){
      if (status == google.maps.places.PlacesServiceStatus.OK){
        bounds = new google.maps.LatLngBounds();
        results.forEach(function (place){
          place.marker = setMarker(place);
          bounds.extend(new google.maps.LatLng(
            place.geometry.location.lat(),
            place.geometry.location.lng()));
        });
        map.fitBounds(bounds);
        results.forEach(allLocations);                 
      }
    }

    this.getFoursquareInfo = function(point) {
      // foursquare api url
      //2BIWS0KFSP1W12ARXFHNA20WHNGY0NMOAD3AFYM1ZGCFCF32
      //I2F4TTJ0HJOIAO2GCPP0T2NJBMMHFVMCLAQ4HIHF5U1JZCNG
      var foursquare = 'https://api.foursquare.com/v2/venues/search?client_id=2BIWS0KFSP1W12ARXFHNA20WHNGY0NMOAD3AFYM1ZGCFCF32'+
      '&client_secret=I2F4TTJ0HJOIAO2GCPP0T2NJBMMHFVMCLAQ4HIHF5U1JZCNG'+
      '&v=20150321&ll=30.056508, 31.337882&query=\''+ point['name'] + '\'&limit=10';
      
      // start ajax and grab: venue name, phone number and twitter handle
      $.getJSON(foursquare).done(function(response) {
          self.fourSquareAPI = '<br>' + 'Foursquare Information::' + '<br>';
          var venue = response.response.venues[0];             
          var venueName = venue.name;

          if (venueName !== null && venueName !== undefined) {
            self.fourSquareAPI += 'Name: ' + venueName + '<br>';
          } else {
            self.fourSquareAPI += venue.name;
          }    
          
          var phoneNumber = venue.contact.formattedPhone;
            if (phoneNumber !== null && phoneNumber !== undefined) {
              self.fourSquareAPI += 'Phone: ' + phoneNumber + ' ';
            } else {
              self.fourSquareAPI += 'Phone not available' + ' ';
            }

          var twitterHandle = venue.contact.twitter;
          if (twitterHandle !== null && twitterHandle !== undefined) {
            self.fourSquareAPI += '<br>' + 'twitter: @' + twitterHandle;
            }
        }).fail(function(jqxhr, textStatus, error){
          var err = textStatus + ", " + error;
          console.log("Request Failed:" + err);  
        });
    }; 
 
 // open infowindow upon click
  self.clickMarker = function(place) {
    var marker;
    for(var i = 0; i < markers.length; i++) {      
      if(place.place_id === markers[i].place_id) { 
        marker = markers[i];
      }
    } 
    self.getFoursquareInfo(place);         
    map.panTo(marker.position);   

    // allows getFoursquareInfo function to load first
    setTimeout(function() {
      var contentString = '<div style="font-weight: 300">' + place.name + '</div><div>' + place.address + '</div>' + self.fourSquareAPI;
      infowindow.setContent(contentString);
      infowindow.open(map, marker); 
      marker.setAnimation(google.maps.Animation.DROP); 
    }, 300);     
  };

 function allLocations(place){
    var myLocation = {};    
    myLocation.place_id = place.place_id;
    myLocation.position = place.geometry.location.toString();
    myLocation.name = place.name;

    if (typeof(place.vicinity) !== undefined) {
      address = place.vicinity;
    } else if (typeof(place.formatted_address) !== undefined) {
      address = place.formatted_address;
    }
    myLocation.address = address;
    
 self.Location_Arr.push(myLocation);        
}

google.maps.event.addDomListener(window, 'resize', function(){
    map.setCenter(egypt); 
  }); 

  // load the map in the window
google.maps.event.addDomListener(window, 'load', init);
  




 }
$(function(){
  ko.applyBindings(new viewModel());
});
