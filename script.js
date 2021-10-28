class FeatureType {
  static empty = "Empty"
  static unchecked = "Unchecked"
  static checked = "Checked"
}

class ServerFeatureRepository {
  resource = {
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
        },
        type: FeatureType.empty
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
        },
        type: FeatureType.unchecked
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.414, 40.776]
        },
        properties: {
          title: 'Mapbox',
          description: 'San Francisco, California'
        },
        type: FeatureType.checked
      }
    ]
  };

  getAll() {
    return this.resource.features
  }

  setFeature(feature) {

  }

  delete(feature) {

  }
}

class MapFeatureRepository {
  static currentMarker

  constructor(map, mapboxManager) {
    this.map = map
    this.mapboxManager = mapboxManager
  }

  setFeature(feature) {
    // create a HTML element for each feature
    const markerElement = document.createElement('div');

    if (feature.type === FeatureType.empty) {
      markerElement.className = 'empty-point';
    } else if (feature.type === FeatureType.unchecked) {
      markerElement.className = 'unchecked-point'
    } else if (feature.type === FeatureType.checked) {
      markerElement.className = 'checked-point'
    }

    // make a marker for each feature and add to the map
    var marker = new mapboxgl
      .Marker(markerElement);

    markerElement.addEventListener('click', function () {
      MapboxManager.currentFeature = feature
      MapFeatureRepository.currentMarker = marker
    });

    marker
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(
            '<h3><button type="button" onclick="deleteCurrentFeature()">Удалить</button></h3>'
            // `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
          )
      )
      .addTo(this.map);
  }

  deleteCurrentMarker() {
    MapFeatureRepository.currentMarker.remove()
  }
}

class FeatureRepository {
  constructor(serverFeatureRepository, mapFeatureRepository) {
    this.serverFeatureRepository = serverFeatureRepository
    this.mapFeatureRepository = mapFeatureRepository
  }

  setFeature(feature) {
    this.serverFeatureRepository.setFeature(feature)
    this.mapFeatureRepository.setFeature(feature)
  }

  deleteFeature(feature) {
    this.serverFeatureRepository.delete(feature)
    this.mapFeatureRepository.deleteCurrentMarker()
  }
}


class MapboxManager {
  static currentFeature

  constructor(serverFeatureRepository) {
    this.serverFeatureRepository = serverFeatureRepository
  }

  setStoredPoints() {
    // add markers to map
    const features = this.serverFeatureRepository.getAll()

    for (const feature of features) {
      this.featureRepository.setFeature(feature)
    }
  }

  run() {
    this.initialize()
    this.setStoredPoints()
  }

  initialize() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidmxhZGltaXJndWxpYWV2IiwiYSI6ImNrdjB6N2c2ZjM1MDUyb2xuMnRjMHh6M3cifQ.8Z9Z5v4XxfdgaNhlDhFh1w';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-96, 37.8],
      zoom: 3
    });

    const mapFeatureRepository = new MapFeatureRepository(this.map, this)
    this.featureRepository = new FeatureRepository(this.serverFeatureRepository, mapFeatureRepository)
  }

  setEmptyFeature() {
    const oldCursor = this.map.getCanvas().style.cursor

    this.map.getCanvas().style.cursor = 'pointer';

    this.map.once('click', (e) => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        },
        properties: {
          title: 'Mapbox',
          description: 'Washington, D.C.'
        },
        type: FeatureType.empty
      };

      this.featureRepository.setFeature(feature)
      this.map.getCanvas().style.cursor = oldCursor;
    });
  }

  deleteCurrentFeature() {
    this.featureRepository.deleteFeature(MapboxManager.currentFeature)
  }
}


const serverFeatureRepository = new ServerFeatureRepository()
const mapboxManager = new MapboxManager(serverFeatureRepository)

mapboxManager.run()


function setEmptyFeature() {
  mapboxManager.setEmptyFeature()
}

function deleteCurrentFeature() {
  mapboxManager.deleteCurrentFeature()
}
