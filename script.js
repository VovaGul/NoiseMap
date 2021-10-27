mapboxgl.accessToken = 'pk.eyJ1IjoidmxhZGltaXJndWxpYWV2IiwiYSI6ImNrdjB6N2c2ZjM1MDUyb2xuMnRjMHh6M3cifQ.8Z9Z5v4XxfdgaNhlDhFh1w';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-96, 37.8],
  zoom: 3
});

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-77.032, 38.913]
      },
      properties: {
        title: 'Mapbox',
        description: 'Washington, D.C.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.414, 37.776]
      },
      properties: {
        title: 'Mapbox',
        description: 'San Francisco, California'
      }
    }
  ]
};

map.getCanvas().style.cursor = 'pointer';

// add markers to map
for (const feature of geojson.features) {
  // create a HTML element for each feature
  const el = document.createElement('div');
  el.className = 'marker';

  // make a marker for each feature and add to the map
  new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
}

// new mapboxgl.Marker(el)
//   .setLngLat(feature.geometry.coordinates)
//   .setPopup(
//     new mapboxgl.Popup({ offset: 25 }) // add popups
//       .setHTML(
//         `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
//       )
//   )
//   .addTo(map);

map.on('click', (e) => {
  const feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [e.lngLat.lng, e.lngLat.lat]
    },
    properties: {
      title: 'Mapbox',
      description: 'Washington, D.C.'
    }
  };

  // create a HTML element for each feature
  const el = document.createElement('div');
  el.className = 'marker';

  // make a marker for each feature and add to the map
  new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
});
