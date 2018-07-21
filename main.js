'user strict';

$(function(){

	$("#distance-between").change(function(){
		let slider1 = $("#distance-between").val();
		$("#distance-percent").text(slider1);
	});

	$("form").submit(function(e){
		e.preventDefault();
		let myAddress = getAddress("#my-address");
		let yourAddress =getAddress("#your-address");
		let percentDistance = getPercentDistance();
		findMiddleGround(myAddress, yourAddress, percentDistance);
		console.log(myAddress, yourAddress)
	});

	function getAddress(element){
		let address = $(`${element}`).val()
		return address
	};

	function getPercentDistance(){
		let distance = $("#distance-between").val();
		if(distance < 1){
			distance = 1;
		} 
		return distance / 100;
	}

	function findMiddleGround(start, end, percentDistance){
		let directionsService = new google.maps.DirectionsService();
		let directionsRequest = {
			origin: start,
			destination: end,
			travelMode: google.maps.DirectionsTravelMode.DRIVING,
		
		};
		directionsService.route(directionsRequest, function (response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				startPoint = response.routes[0].legs[0].start_location;
				endPoint = response.routes[response.routes.length-1].legs[0].end_location;
				let pos = google.maps.geometry.spherical.interpolate(startPoint,endPoint, percentDistance);
				console.log(pos.lat(), pos.lng());
				let lat = pos.lat();
				let lng = pos.lng();
				initialize(lat, lng)
			}
		})
	}

	function initialize(latitude, longitude) {
		var pyrmont = new google.maps.LatLng(latitude,longitude);
	  
		map = new google.maps.Map(document.getElementById('map'), {
			center: pyrmont,
			zoom: 15
		  });
	  
		var request = {
		  location: pyrmont,
		  radius: '500',
		  query: 'restaurant',
		};
	  
		service = new google.maps.places.PlacesService(map);
		service.textSearch(request, callback);
	  }
	  
	  function callback(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			console.log(results);	
		  for (var i = 0; i < results.length; i++) {
			var place = results[i];
			if(results[i].photos){
				console.log(results[i].photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200}));
			}
			marker = new google.maps.Marker({ position: place.geometry.location, map: map });
		  }
		}
	  }
	


});


