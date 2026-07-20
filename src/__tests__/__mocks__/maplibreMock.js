class MockMarker {
  constructor(config = {}) {
    this.element = config.element || null;
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
  constructor(options) {
    this.options = options || {};
    this.container = this.options.container || null;
    this.markers = [];
    this.controls = [];
    this.listeners = {};
    this.style = this.options.style;
    this.center = this.options.center;
    this.zoom = this.options.zoom;
    this.loaded = false;

    // Simulate load event after a small delay
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.loaded = true;
        this.fire('load');
      }, 0);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  fire(event) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback();
        } catch (e) {
          console.error('Error in map event listener:', e);
        }
      });
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
    this.listeners = {};
  }

  isLoaded() {
    return this.loaded;
  }
}

function NavigationControl() {}

export default {
  Map: MockMap,
  Marker: MockMarker,
  NavigationControl: NavigationControl,
};
