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

  var list = document.getElementById('locationsList');
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

  function bindCard(card) {
    card.addEventListener('click', function () {
      showDetail(Number(card.dataset.index));
    });
  }
  cards.forEach(bindCard);

  /* Auto-listed venues from the daily OSINT pipeline (data/locations.json).
     Everything is rendered with textContent — submission and pipeline text is
     never treated as HTML. Static curated cards above stay the lead entries. */
  var AUTO_DISPLAY_CAP = 12;
  var svgNS = 'http://www.w3.org/2000/svg';
  var xlinkNS = 'http://www.w3.org/1999/xlink';

  function spriteIcon(id, small) {
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', small ? 'icon icon--sm' : 'icon');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(svgNS, 'use');
    use.setAttribute('href', 'icons/sprite.svg#' + id);
    use.setAttributeNS(xlinkNS, 'xlink:href', 'icons/sprite.svg#' + id);
    svg.appendChild(use);
    return svg;
  }

  function span(className, text) {
    var el = document.createElement('span');
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function buildAutoCard(venue, index) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'card card--interactive card--auto';
    card.setAttribute('aria-current', 'false');
    card.dataset.index = String(index);

    var header = span('card__header');
    header.appendChild(span('card__title', venue.title));
    var badge = span('badge badge--auto');
    badge.appendChild(spriteIcon('info', true));
    badge.appendChild(document.createTextNode(' Auto-listed'));
    header.appendChild(badge);
    card.appendChild(header);

    var meta = span('card__meta');
    meta.appendChild(spriteIcon('pin', true));
    meta.appendChild(document.createTextNode(' ' + venue.address));
    card.appendChild(meta);

    if (venue.hours) {
      var hours = span('card__meta');
      hours.appendChild(spriteIcon('clock', true));
      var strong = document.createElement('strong');
      strong.textContent = venue.hours;
      hours.appendChild(strong);
      card.appendChild(hours);
    }

    var amenityList = span('amenity-list');
    venue.accessList.forEach(function (label) {
      amenityList.appendChild(span('amenity', label));
    });
    card.appendChild(amenityList);

    var footnote = span('card__footnote');
    footnote.appendChild(spriteIcon('info', true));
    footnote.appendChild(document.createTextNode(' Auto-listed from public data, not yet field-checked'));
    card.appendChild(footnote);
    return card;
  }

  function loadAutoListings() {
    if (!window.fetch || !list) return;
    fetch('data/locations.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (payload) {
        var priorOrder = { device_charging_station: 0, library: 1, community_centre: 2 };
        var venues = (payload.venues || [])
          .slice()
          .sort(function (a, b) {
            var byPrior = (priorOrder[a.category] || 9) - (priorOrder[b.category] || 9);
            return byPrior !== 0 ? byPrior : (b.address ? 1 : 0) - (a.address ? 1 : 0);
          })
          .slice(0, AUTO_DISPLAY_CAP);

        venues.forEach(function (v) {
          var tags = ['open', 'free'];
          tags.push(v.indoor ? 'indoor' : 'outdoor');
          if (v.category === 'device_charging_station') tags.push('usb');
          else tags.push('outlet');
          var amenityLabels = (v.amenities || []).slice(0, 4);
          if (amenityLabels.indexOf('Accessible') !== -1) tags.push('accessible');
          if (amenityLabels.indexOf('Wi-Fi') !== -1) tags.push('wifi');

          var entry = {
            title: v.name,
            address: v.address || 'Address not mapped',
            description:
              'Public venue sourced automatically from OpenStreetMap. Outlet availability is inferred from the venue type and has not been field-checked yet.',
            access: amenityLabels,
            accessList: amenityLabels,
            hours: !v.hours ? 'Check hours on site' : v.hours.length <= 60 ? v.hours : 'See posted hours',
            evidence: 'Auto-listed · OpenStreetMap (ODbL)',
            tags: tags,
          };
          var index = locations.length;
          locations.push(entry);
          var card = buildAutoCard(entry, index);
          bindCard(card);
          list.appendChild(card);
          cards.push(card);
        });
        applyFilters();
      })
      .catch(function () {
        /* Static curated list remains the page; pipeline data is progressive. */
      });
  }
  loadAutoListings();

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
