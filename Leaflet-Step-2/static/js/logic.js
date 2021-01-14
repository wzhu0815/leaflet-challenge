//past week data
const url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const cycleScale = 20000;

// https://leafletjs.com/examples/choropleth/
function getColor(d) {
  return d > 90
    ? "#800026"
    : d > 70
    ? "#BD0026"
    : d > 50
    ? "#E31A1C"
    : d > 30
    ? "#FF5733"
    : d > 10
    ? "#FFC300"
    : d > -10
    ? "#DAF7A6"
    : "#2EB1BB";
}
// #DAF7A6;

var light = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY,
  }
);

var street = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    // tileSize: 512,
    maxZoom: 18,
    // zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY,
  }
);

var sat = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY,
  }
);

// Only one base layer can be shown at a time
var baseMaps = {
  Satellite: sat,
  Light: light,
  Street: street,
};

// Overlays that may be toggled on or off
// var overlayMaps = {
//   Cities: cityLayer,
// };

// Pass our map layers into our layer control
// Add the layer control to the map

d3.json(url, function (response) {
  var data = response.features;
  var eqMarkers = [];
  data.forEach(function (d) {
    var mag = d.properties.mag;
    var geoData = d.geometry.coordinates;
    if (geoData) {
      var coor = [geoData[1], geoData[0]];
      var dep = geoData[2];

      // console.log(dep);
      eqMarkers.push(
        L.circle(coor, {
          color: getColor(dep),
          fillColor: getColor(dep),
          fillOpacity: 1,
          radius: mag * cycleScale,
        }).bindPopup(
          `<h3>${d.properties.place}</h3><hr>
            <p>Coordinate: [${coor}] <\p>
            <p>Depth: ${dep} km; Magnitude : ${mag}<\p>`
        )
      );
    }
  });
  var eqlayer = L.layerGroup(eqMarkers);
  // data source: https://github.com/fraxen/tectonicplates
  var overlayMaps = {
    Earthquake: eqlayer,
    OO: geoLayer,
  };
  var geoLink = "static/GeoJSON/PB2002_steps.json";
  var mapStyle = {
    color: "yellow",
    fillColor: "none",
    fillOpacity: 0,
    weight: 1.5,
  };
  var geoLayer;

  d3.json(geoLink, function (geoData) {
    // Creating a geoJSON layer with the retrieved data
    geoLayer = L.geoJson(geoData, {
      // Passing in our style object
      style: mapStyle,
    });
    var overlayMaps = {
      Earthquake: eqlayer,
      "Tectonic Plates": geoLayer,
    };

    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 3,
      layers: [sat, eqlayer, geoLayer],
    });

    L.control
      .layers(baseMaps, overlayMaps, {
        collapsed: false,
      })
      .addTo(myMap);

    // Create map object and set default layers

    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (myMap) {
      var div = L.DomUtil.create("div", "info legend"),
        grades = [-10, 10, 30, 50, 70, 90];
      // labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      // https://leafletjs.com/examples/choropleth/
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          getColor(grades[i] + 1) +
          '"></i> ' +
          grades[i] +
          (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }

      return div;
    };
    legend.addTo(myMap);
  });
});
