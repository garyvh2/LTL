(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== SESSION ====================================== //
    var Maps = function (mapId) {
        var _this = this;

        // >> Theme
        _this.theme = new google.maps.StyledMapType([
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ebe3cd"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#523735"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#f5f1e6"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#c9b2a6"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#dcd2be"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#ae9e90"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#93817c"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#a5b076"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#447530"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f1e6"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#fdfcf8"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f8c967"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#e9bc62"
                    }
                ]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e98d58"
                    }
                ]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#db8555"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#806b63"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#8f7d77"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#ebe3cd"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#b9d3c2"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#92998d"
                    }
                ]
            }
        ], { name: 'Theme' });


        _this.markers = [];

        _this.mapId = mapId;
        _this.information = new google.maps.InfoWindow();
        _this.map = $('#' + _this.mapId);
        _this.BaseLocation = {
            lat: 9.9364886,
            lng: -84.1876179
        };
        _this.options = {
            zoom: 14,
            zoomControl: true,
            disableDefaultUI: true,
            fullscreenControl: true
        }

        _this.GetLocation(function (location) {
            _this.MY_LOCATION = location;
            _this.options.center = location
            _this.Init();
        })

        return _this;
    }
    Maps.prototype.GetLocation = function (location) {
        var _this = this;

        navigator.geolocation.getCurrentPosition(function (position) {
            return location({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        }, function () {
            return location(_this.BaseLocation);
        });
    }
    Maps.prototype.Init = function () {
        var _this = this;

        _this.GMap = new google.maps.Map(_this.map[0] || document.getElementById('map'), _this.options);
        _this.GMap.mapTypes.set('theme', _this.theme);
        _this.GMap.setMapTypeId('theme');


        _this.AddMarker(_this.MY_LOCATION, {
            draggable: true
        });

        _this.Autocomplete('autocomplete', true);
    };
    Maps.prototype.AddMarker = function (location, opts) {
        var _this = this;

        var marker = new google.maps.Marker({
            position: location,
            map: _this.GMap,
            draggable: !!opts.draggable
        });

        if (!!opts.draggable) {
            marker.addListener('dragend', function (event) {
                _this.map.trigger('drop_marker', [this])
            });
        }

        if (!!opts.information) {
            marker.addListener('click', function () {
                _this.information.open(_this.GMap, marker);
            });
        }


        _this.markers.push(marker);

        return marker
    }
    Maps.prototype.RemoveMarkers = function (location) {
        var _this = this;

        _.each(_this.markers, function (marker) {
            marker.setMap(null);
        })
    }

    Maps.prototype.Center = function (location) {
        var _this = this;

        _this.GMap.panTo(location);
    }
    Maps.prototype.Autocomplete = function (autocompleteId, clear) {
        var _this = this;

        var autocomplete = $('#' + (autocompleteId || 'autocomplete'))
        var search = new google.maps.places.Autocomplete(autocomplete[0]);
        search.bindTo("bounds", _this.GMap);
        search.addListener('place_changed', function () {
            if (clear) {
                _this.RemoveMarkers();
            }

            var place = search.getPlace();
            if (!place.geometry.viewport) {
                window.alert('Error al mostrar el lugar');
                return;
            }
            if (place.geometry.viewport) {
                _this.GMap.fitBounds(place.geometry.viewport);
            } else {
                _this.GMap.setCenter(place.geometry.location);
                _this.GMap.setZoom(10);
            }

            var marker = _this.AddMarker(place.geometry.location, {
                draggable: true
            });

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || ''),
                ];
            }
            _this.information.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            _this.information.open(_this.Map, marker);



        });
    }
    Maps.prototype.ShowInfo = function (marker) {
        var _this = this;


    }

    ltl.Maps = Maps;
}));