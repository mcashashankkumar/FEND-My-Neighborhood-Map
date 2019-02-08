import React, {Component} from 'react';
import LocationList from './LocationList';

class App extends Component {
    /*
    * Constructor
    */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {'name': "IIM Ranchi",
                    'type': "Management School",
                    'latitude': 23.3531624,
                    'longitude': 85.3185011,
                    'streetAddress': "Suchana Bhawan, 5th Floor, Ranchi, Jharkhand, India"},
                {'name': "St. Xavier’s College, Ranchi-(Autonomous College)",
                    'type': "College",
                    'latitude': 23.3676289,
                    'longitude': 85.3260469,
                    'streetAddress': "Doctor Camil Bulcke Path, Pathalkudwa, Nayatoli, Ranchi, Jharkhand"},
                {'name': "Marwari College",
                    'type': "College",
                    'latitude': 23.3663502,
                    'longitude': 85.3126297,
                    'streetAddress': "Upper Bazar, Ranchi, Jharkhand, India"},
                {'name': "Ranchi Women's College, Science Block",
                    'type': "Women's College",
                    'latitude': 23.378079,
                    'longitude': 85.3275684,
                    'streetAddress': "Circular Rd, Ahirtoli, Ranchi, Jharkhand, India"},
                {'name': "Yogoda Satsanga College, Ranchi",
                    'type': " College",
                    'latitude': 23.3188839,
                    'longitude': 85.2783772,
                    'streetAddress': "Jagannathpur, Ranchi, Jharkhand 834002"},
                {'name': "Maulana Azad College, Ranchi",
                    'type': " College",
                    'latitude': 23.3709138,
                    'longitude': 85.3188223,
                    'streetAddress': "JJ Rd, Upper Bazar, Ranchi, Jharkhand 834001"},
                {'name': "Ranchi College, Ranchi- (Autonomous College)",
                    'type': " College",
                    'latitude': 23.3883003,
                    'longitude': 85.3054898,
                    'streetAddress': "Ranchi University Post, Morahabadi, Ranchi University, Morabadi, Ranchi, Jharkhand 834008"},    
                {'name': "Nirmala Womens College Ranchi",
                    'type': " College",
                    'latitude': 23.3355006,
                    'longitude': 85.3130076,
                    'streetAddress': "New Parastoli, Shyamali Colony, Doranda, Ranchi, Jharkhand 834002"},           
                {'name': "Gossner College, Ranchi",
                    'type': " College",
                    'latitude': 23.3551851,
                    'longitude': 85.3259392,
                    'streetAddress': "Niral Enem Horo Marg, Kanka, Ranchi, Jharkhand 834001"},
                {'name': "Doranda College, Ranch",
                    'type': "College",
                    'latitude': 23.3372989,
                    'longitude': 85.318084,
                    'streetAddress': "Hinoo Main Road, Opp. Shree Krishna Park,Near Oreintal Bank, Doranda, Shyamali Colony, Doranda, Ranchi, Jharkhand 834002"}
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        window.initMap = this.initMap;
        drawMap('https://maps.googleapis.com/maps/api/js?key=AIzaSyCzzkiSUZZec073TqPSCYFycXqRjny61-U&callback=initMap')
    } 

    /*
    * Init the map once the google map's script is loaded*/
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 23.366765, lng: 85.312344},
            zoom: 15,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /* Open InfoWindow for the marker */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /*
    * Retrive location data from Foursquare API for the marker
    */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "CIOD2YTONLCM14LWZ5INMI4HRD43QLOGDIPAYSAGXHNHVRNZ";
        var clientSecret = "4W2LYCNHH51JZBZ4FHKMWPHNQ5DEYXNUI54XVWTBZZZYNROK";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /*
    * Close the InfoWindow for the marker
    */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /*
    * Render function of App
    */
    render() {
        return (
            <div>
                <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow} closeInfoWindow={this.closeInfoWindow}/>
                <div id="map" role="application" aria-label="map"></div>
            </div>
        );
    }
}

export default App;

/*
* Load the google maps asynchronously
*/
function drawMap(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    window.gm_authFailure = () => {
        document.write("Google Maps API Authorization Failure");
    };
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}
