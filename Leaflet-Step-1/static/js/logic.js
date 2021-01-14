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

var dark = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY,
  }
);

// Only one base layer can be shown at a time
var baseMaps = {
  Light: light,
  Dark: dark,
};

// Overlays that may be toggled on or off
// var overlayMaps = {
//   Cities: cityLayer,
// };

// Create map object and set default layers
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 3,
  layers: [light],
});

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps).addTo(myMap);

d3.json(url, function (response) {
  var data = response.features;

  data.forEach(function (d) {
    var mag = d.properties.mag;
    var geoData = d.geometry.coordinates;
    if (geoData) {
      var coor = [geoData[1], geoData[0]];
      var dep = geoData[2];

      console.log(dep);
      L.circle(coor, {
        color: getColor(dep),
        fillColor: getColor(dep),
        fillOpacity: 1,
        radius: mag * cycleScale,
      })
        .bindPopup(
          `<h3>${d.properties.place}</h3>
          <h4>Coordinate: [${coor}] <\h4>
          <h4>Depth: ${dep} km, Mag: ${mag}<\h4>`
        )
        .addTo(myMap);
    }
  });
});

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (myMap) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [-10, 10, 30, 50, 70, 90],
    labels = [];

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
