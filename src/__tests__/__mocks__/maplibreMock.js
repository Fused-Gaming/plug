class MockMarker {
  constructor({ element } = {}) {
    this.element = element;
    this.lngLat = null;
    this.map = null;
  }

  setLngLat(lngLat) {
    this.lngLat = lngLat;
    return this;
  }

  addTo(map) {
    this.map = map;
    return this;
  }

  remove() {
    this.map = null;
  }

  getElement() {
    return this.element;
  }
}

class MockMap {
  constructor(options = {}) {
    this.options = options;
    this.container = options.container;
    this.markers = new Map();
    this.controls = [];
    this.listeners = {};
    this.style = options.style;
    this.center = options.center;
    this.zoom = options.zoom;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    // Simulate load event
    if (event === 'load') {
      setTimeout(() => callback(), 0);
    }
  }

  addControl(control, position) {
    this.controls.push({ control, position });
  }

  flyTo(options) {
    this.center = options.center;
    this.zoom = options.zoom;
  }

  remove() {
    this.markers.clear();
    this.listeners = {};
  }
}

export default {
  Map: MockMap,
  Marker: MockMarker,
  NavigationControl: class {
    constructor() {}
  },
};
