var currentFeature
var currentMarker

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
      currentFeature = feature
      currentMarker = marker
    });

    const acceptButtonHTML = '<h3><button type="button" onclick="acceptCurrentFeature()">Принять</button></h3>'
    const rejectButtonHTML = '<h3><button type="button" onclick="rejectCurrentFeature()">Отклонить</button></h3>'
    const deleteButtonHTML = '<h3><button type="button" onclick="deleteCurrentFeature()">Удалить</button></h3>'

    var popupHTML = ''
    if (feature.type === FeatureType.unchecked) {
      popupHTML = popupHTML + acceptButtonHTML + rejectButtonHTML
    } else if (feature.type === FeatureType.checked) {
      popupHTML = popupHTML + rejectButtonHTML
    }
    popupHTML =  popupHTML + deleteButtonHTML

    marker
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(popupHTML)
      )
      .addTo(this.map);
  }

  deleteCurrentMarker() {
    currentMarker.remove()
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

  acceptCurrentFeature() {
    const oldCurrnetFeature = currentFeature
    this.featureRepository.deleteFeature(currentFeature)

    oldCurrnetFeature.type = FeatureType.checked

    this.featureRepository.setFeature(oldCurrnetFeature)
  }

  rejectCurrentFeature() {
    const oldCurrnetFeature = currentFeature
    this.featureRepository.deleteFeature(currentFeature)

    oldCurrnetFeature.type = FeatureType.empty

    this.featureRepository.setFeature(oldCurrnetFeature)
  }

  deleteCurrentFeature() {
    this.featureRepository.deleteFeature(currentFeature)
  }
}


const serverFeatureRepository = new ServerFeatureRepository()
const mapboxManager = new MapboxManager(serverFeatureRepository)

mapboxManager.run()

function setEmptyFeature() {
  mapboxManager.setEmptyFeature()
}

function acceptCurrentFeature() {
  mapboxManager.acceptCurrentFeature()
}

function rejectCurrentFeature() {
  mapboxManager.rejectCurrentFeature()
}

function deleteCurrentFeature() {
  mapboxManager.deleteCurrentFeature()
}
