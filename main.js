'user strict';

$(function(){

	let formRequest = {
		getValue: function(selector){
			return $(`${selector}`).val();
		},
		createDistancePercent: function(selector){
			let distance = this.getValue(selector);
			if(distance < 1){
				distance = 1;
			} 
			return distance / 100;
		}
	};
	let formResponse= {
		changeMeetUpValue: function(silderValue, selector){
			let slider1 = parseInt(silderValue, 10);
			let dynamicResponse = "";
			if(slider1 >= 45 && slider1 <= 55){
				dynamicResponse = "somewhere in the middle";
			} else if(slider1 < 1){
				dynamicResponse = "closer to my place";
			}else if (slider1  < 44){
				dynamicResponse = "at my place";
			} else if(slider1 === 100){
				dynamicResponse = "at your place";
			}
			else{
				dynamicResponse = "closer to your place";
			}
			$(`${selector}`).text(dynamicResponse);
			$("#distance-percent").text(slider1);
		},
		findMiddleGround: function(start, end){
			let directionsService = new google.maps.DirectionsService();
			let directionsRequest = {
			origin: start,
			destination: end,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
				};
			return [directionsService, directionsRequest];
		},
		googleResponse: function (response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				startPoint = response.routes[0].legs[0].start_location;
				endPoint = response.routes[response.routes.length-1].legs[0].end_location;
				let percentDistance = formRequest.createDistancePercent("#distance-between");
				let userQuery = formRequest.getValue("#user-query");
				let pos = google.maps.geometry.spherical.interpolate(startPoint,endPoint, percentDistance);
				let lat = pos.lat();
				let lng = pos.lng();
				formResponse.findLocalSpots(lat, lng, userQuery)
			}
		},
		findLocalSpots: function(latitude, longitude, userQuery){
			var coordinates = new google.maps.LatLng(latitude,longitude);
			map = new google.maps.Map(document.getElementById('map'), {
				center: coordinates,
				zoom: 13
				});
			let request = {
				location: coordinates,
				radius: '500',
				query: userQuery,
			};
			service = new google.maps.places.PlacesService(map);
			service.textSearch(request, formResponse.callback);
		},
		callback: function(results, status){
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log(results);	
				$("#query-results").text("");
				for (let i = 0; i < results.length; i++) {
				let finalresults = "";
				let place = results[i];
				let newplace = `<article>
				<div class="details">
					<div class="col-6">
						<h3 id="query-title">${place.name}</h3>
					</div>
					<div class="col-6" class="query-info">
						<h4>Rating: <span class="query-rating">${place.rating}</span><i class="fas fa-star"></i></h4>
						<h4>Price: <span>${formResponse.setNumberOfDollar(place.price_level, i)}</span></h4>
						<h3>${place.formatted_address}</h3>		
							</div>
						</div>
					</article>
				`
				finalresults += newplace;
				$("#query-results").append(finalresults);
				marker = new google.maps.Marker({ position: place.geometry.location, map: map, title: place.name });
				}
			}

		},
		setNumberOfDollar: function(number, index){
			let dollarsigns = "";
			if(number){
				for(let i = 0; i < number; i++){
					dollarsigns += `<i class="fas fa-dollar-sign"></i>`;
				}
			}else{
				dollarsigns = "No Data"
			}
			return dollarsigns;
		}

		}


	$("#distance-between").change(function(){
			let distanceBetween = formRequest.getValue("#distance-between");
			formResponse.changeMeetUpValue(distanceBetween, "#meet-up-text");
	});

	$("form").submit(function(e){
		e.preventDefault();
		let myAddress = formRequest.getValue("#my-address");
		let yourAddress = formRequest.getValue("#your-address");
		let [directionsService, directionsRequest] = formResponse.findMiddleGround(myAddress, yourAddress);
		directionsService.route(directionsRequest, formResponse.googleResponse);
	});

	


});


