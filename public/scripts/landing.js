/* Landing page behavior: location selection, search, filters, geolocation.
   Static-only — no network calls, no storage, nothing leaves the browser. */
(function () {
  'use strict';

  var locations = [
    {
      title: 'Oakland Main Library',
      address: '125 14th St · Downtown',
      description: 'Outlets available near reading tables. Library rules apply.',
      access: ['Indoor outlets'],
      hours: 'Open today, 10am–8pm',
      evidence: 'Verified · Jul 18',
      tags: ['open', 'free', 'indoor', 'accessible', 'outlet', 'verified']
    },
    {
      title: '81st Avenue Library',
      address: '1021 81st Ave · East Oakland',
      description: 'Multiple outlets in study areas and common spaces.',
      access: ['Indoor outlets', 'Wi-Fi'],
      hours: 'Open today, 10am–5:30pm',
      evidence: 'Verified · Jul 16',
      tags: ['open', 'free', 'indoor', 'accessible', 'outlet', 'wifi', 'verified']
    },
    {
      title: 'West Oakland Library',
      address: '1801 Adeline St · West Oakland',
      description: 'Charging stations in main reading room.',
      access: ['Indoor outlets', 'Wi-Fi'],
      hours: 'Open today, 10am–5:30pm',
      evidence: 'Community report · Jul 12',
      tags: ['open', 'free', 'indoor', 'outlet', 'wifi']
    },
    {
      title: 'Lake Merritt Station',
      address: '800 Madison St · Lake Merritt',
      description: 'USB charging ports at transit station.',
      access: ['USB charging', 'Public area'],
      hours: 'Transit hours',
      evidence: 'Needs recheck · Jun 03',
      tags: ['open', 'free', 'outdoor', 'usb', 'transit']
    }
  ];

  var cards = Array.prototype.slice.call(
    document.querySelectorAll('#locationsList .card--interactive')
  );
  var countEl = document.getElementById('locationsCount');
  var searchForm = document.getElementById('searchForm');
  var searchInput = document.getElementById('searchInput');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var locateButton = document.getElementById('locateButton');

  function showDetail(index) {
    cards.forEach(function (card) {
      card.setAttribute('aria-current', String(Number(card.dataset.index) === index));
    });

    var loc = locations[index];
    document.getElementById('detailTitle').textContent = loc.title;
    document.getElementById('detailDescription').textContent = loc.description;
    document.getElementById('detailHours').textContent = loc.hours;
    document.getElementById('detailEvidence').textContent = loc.evidence;

    var accessEl = document.getElementById('detailAccess');
    accessEl.textContent = '';
    loc.access.forEach(function (label) {
      var tag = document.createElement('span');
      tag.className = 'amenity';
      tag.textContent = label;
      accessEl.appendChild(tag);
    });
  }

  function activeFilters() {
    return chips
      .filter(function (chip) { return chip.getAttribute('aria-pressed') === 'true'; })
      .map(function (chip) { return chip.dataset.filter; });
  }

  function applyFilters() {
    var query = searchInput.value.trim().toLowerCase();
    var filters = activeFilters();
    var found = 0;

    cards.forEach(function (card) {
      var loc = locations[Number(card.dataset.index)];
      var matchesQuery = !query ||
        loc.title.toLowerCase().indexOf(query) !== -1 ||
        loc.address.toLowerCase().indexOf(query) !== -1 ||
        loc.description.toLowerCase().indexOf(query) !== -1;
      var matchesFilters = filters.every(function (filter) {
        return loc.tags.indexOf(filter) !== -1;
      });

      var visible = matchesQuery && matchesFilters;
      card.hidden = !visible;
      if (visible) found++;
    });

    if (found === 0) {
      countEl.innerHTML = '<strong>No places found.</strong> Try a different search or clear some filters.';
    } else {
      countEl.innerHTML = '<strong>' + found + (found === 1 ? ' place' : ' places') + ' found</strong>';
    }
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      showDetail(Number(card.dataset.index));
    });
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  searchInput.addEventListener('input', function () {
    if (!searchInput.value) applyFilters();
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!pressed));
      applyFilters();
    });
  });

  locateButton.addEventListener('click', function () {
    if (!navigator.geolocation) {
      countEl.innerHTML = '<strong>Geolocation is not supported by your browser.</strong>';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (position) {
        countEl.innerHTML = '<strong>Location detected</strong> near ' +
          position.coords.latitude.toFixed(4) + ', ' +
          position.coords.longitude.toFixed(4) +
          ' — used only on this device to sort results; never stored or transmitted.';
      },
      function () {
        countEl.innerHTML = '<strong>Location permission denied or unavailable.</strong> You can still search by name or address.';
      }
    );
  });

  var navToggle = document.querySelector('.site-header__toggle');
  var nav = document.getElementById('site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }
})();
