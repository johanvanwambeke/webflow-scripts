document.addEventListener('DOMContentLoaded', () => {
(function () {
  // ── Config ──
  const DEBUG = /[?&]debug=1/.test(window.location.search);
  const DEBOUNCE_MS = 300;
  const mapboxToken =
    'pk.eyJ1Ijoid2ViZmxvd2ZhY3RvcnkiLCJhIjoiY21iYzBybmtzMGx0aDJsc2EyZnhtc3UyYyJ9.JdE94uPsziSxT2YYI3lIJQ';

  if (DEBUG) console.log('jobs.js active');

  // ── Globals ──
  let publicJoblist = null;
  let userLat = null;
  let userLng = null;
  let place = null;
  let placeLabel = '';
  let placeId = '';
  let map = null;
  let markers = [];
  let filteredJobList = [];
  let mapInitialized = false;

  // ── DOM references ──
  const input = document.getElementById('autocomplete');
  const distanceInput = document.getElementById('distance');
  const omgevingNaam = document.getElementById('place');
  const clearFilterBtn = document.getElementById('clearFilterBtn');
  const params = new URLSearchParams(window.location.search);

  // ── Guard core elements ──
  if (!input) {
    console.error('jobs.js: #autocomplete input not found, stopping.');
    return;
  }
  if (!distanceInput) {
    console.error('jobs.js: #distance input not found, stopping.');
    return;
  }

  // ── Guard Google Maps API ──
  if (typeof google === 'undefined' || !google.maps?.places) {
    console.error('jobs.js: Google Maps Places API not loaded, stopping.');
    return;
  }

  // ── Checkbox toggle (data-click-title) ──
  document.addEventListener('click', (event) => {
    const titleEl = event.target.closest('[data-click-title]');
    if (!titleEl) return;
    let scope = titleEl;
    while (scope && !scope.querySelector('.w-checkbox-input')) {
      scope = scope.parentElement;
    }
    if (!scope) return;
    const inputs = Array.from(scope.querySelectorAll('.w-checkbox-input'));
    if (!inputs.length) return;
    const shouldTurnOn = inputs.some((i) => !i.checked);
    inputs.forEach((cb) => {
      if (shouldTurnOn && !cb.checked) cb.click();
      if (!shouldTurnOn && cb.checked) cb.click();
    });
  });

  // ── Helpers ──

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Init Finsweet Filter (Attributes v2) ──
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      publicJoblist = listInstances[0];
      publicJoblist.addHook('filter', (items) => {
        const hasLocation = userLat != null && userLng != null && !!placeLabel;
        if (!hasLocation) {
          filteredJobList = items;
          addMapMarkers(filteredJobList);
          return items;
        }
        const inRadiusItems = items.filter((item) => isItemInRadius(item.element));
        filteredJobList = inRadiusItems;
        addMapMarkers(filteredJobList);
        return inRadiusItems;
      });
      initURLParams();
    },
  ]);

  // ── Event Listeners ──

  clearFilterBtn?.addEventListener('click', () => {
    resetFilters();
    if (publicJoblist) publicJoblist.triggerHook('filter');
  });

  const onDistanceChange = debounce(() => {
    if (distanceInput.value < 0) distanceInput.value = 0;
    if (!placeLabel) return;
    if (omgevingNaam) {
      omgevingNaam.innerText = `${placeLabel} < ${distanceInput.value}km`;
    }
    updateURLWithParams(distanceInput.value, placeLabel, placeId, userLat, userLng);
    if (DEBUG) console.log('filter — distance change');
    if (publicJoblist) publicJoblist.triggerHook('filter');
  }, DEBOUNCE_MS);

  distanceInput.addEventListener('input', onDistanceChange);

  // ── Google Places Autocomplete ──
  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: ['nl', 'be'] },
    fields: ['geometry.location', 'place_id', 'formatted_address', 'name'],
  });

  autocomplete.addListener('place_changed', () => {
    const selected = autocomplete.getPlace();
    if (!selected?.geometry?.location) return;

    userLat = selected.geometry.location.lat();
    userLng = selected.geometry.location.lng();
    place = selected;
    placeId = selected.place_id || '';
    placeLabel = selected.formatted_address || selected.name || input.value || '';

    sessionStorage.setItem('userLat', userLat);
    sessionStorage.setItem('userLng', userLng);
    sessionStorage.setItem('placeLabel', placeLabel);
    sessionStorage.setItem('placeId', placeId);

    if (omgevingNaam) {
      omgevingNaam.innerText = `${placeLabel} < ${distanceInput.value}km`;
      omgevingNaam.style.display = 'inline-flex';
    }

    updateURLWithParams(distanceInput.value, placeLabel, placeId, userLat, userLng);
    if (DEBUG) console.log('filter — autocomplete');
    if (publicJoblist) publicJoblist.triggerHook('filter');
  });

  // ── Init Functions ──

  function initURLParams() {
    const maxdistance = params.get('maxdistance');
    const placeQuery = params.get('place');
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const placeIdParam = params.get('placeId');

    if (maxdistance) distanceInput.value = maxdistance;

    // Priority 1: lat/lng in URL — no Google API call needed
    if (latParam && lngParam && placeQuery) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        userLat = lat;
        userLng = lng;
        placeLabel = placeQuery;
        placeId = placeIdParam || '';
        place = null;
        input.value = placeLabel;
        if (omgevingNaam) {
          omgevingNaam.innerText = `${placeLabel} < ${distanceInput.value}km`;
          omgevingNaam.style.display = 'inline-flex';
        }
        if (publicJoblist) publicJoblist.triggerHook('filter');
        if (DEBUG) console.log('filter — restored via URL lat/lng');
        return;
      }
    }

    // Priority 2: sessionStorage — avoids Google call on same-session navigation
    if (placeQuery) {
      const cachedLat = sessionStorage.getItem('userLat');
      const cachedLng = sessionStorage.getItem('userLng');
      const cachedLabel = sessionStorage.getItem('placeLabel');
      if (cachedLat && cachedLng && cachedLabel === placeQuery) {
        const lat = parseFloat(cachedLat);
        const lng = parseFloat(cachedLng);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          userLat = lat;
          userLng = lng;
          placeLabel = placeQuery;
          placeId = sessionStorage.getItem('placeId') || placeIdParam || '';
          place = null;
          input.value = placeLabel;
          if (omgevingNaam) {
            omgevingNaam.innerText = `${placeLabel} < ${distanceInput.value}km`;
            omgevingNaam.style.display = 'inline-flex';
          }
          updateURLWithParams(distanceInput.value, placeLabel, placeId, userLat, userLng);
          if (publicJoblist) publicJoblist.triggerHook('filter');
          if (DEBUG) console.log('filter — restored via sessionStorage');
          return;
        }
      }
      // Priority 3: fallback — resolve via Google (2 API calls)
      getAndSelectFirstPlacePrediction(placeQuery);
      return;
    }

    // No location — just run filter to init map
    if (publicJoblist) publicJoblist.triggerHook('filter');
    if (DEBUG) console.log('filter — init (no location)');
  }

  function resetFilters() {
    input.value = '';
    distanceInput.value = 20;
    if (omgevingNaam) omgevingNaam.style.display = 'none';
    userLat = null;
    userLng = null;
    place = null;
    placeLabel = '';
    placeId = '';
    sessionStorage.removeItem('userLat');
    sessionStorage.removeItem('userLng');
    sessionStorage.removeItem('placeLabel');
    sessionStorage.removeItem('placeId');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // ── Google Places Helpers ──

  function getAndSelectFirstPlacePrediction(inputText) {
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: inputText,
        componentRestrictions: { country: ['nl', 'be'] },
      },
      (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions?.length) {
          if (DEBUG) console.warn('No place predictions for:', inputText);
          return;
        }
        const first = predictions[0];
        const placesService = new google.maps.places.PlacesService(
          document.createElement('div')
        );
        placesService.getDetails(
          {
            placeId: first.place_id,
            fields: ['geometry.location', 'place_id', 'formatted_address', 'name'],
          },
          (placeResult, detailsStatus) => {
            if (detailsStatus !== google.maps.places.PlacesServiceStatus.OK) return;
            if (!placeResult?.geometry?.location) return;

            userLat = placeResult.geometry.location.lat();
            userLng = placeResult.geometry.location.lng();
            place = placeResult;
            placeId = placeResult.place_id || first.place_id || '';
            placeLabel =
              placeResult.formatted_address || placeResult.name || inputText;

            input.value = placeLabel;

            // Cache for future navigations
            sessionStorage.setItem('userLat', userLat);
            sessionStorage.setItem('userLng', userLng);
            sessionStorage.setItem('placeLabel', placeLabel);
            sessionStorage.setItem('placeId', placeId);

            if (omgevingNaam) {
              omgevingNaam.innerText = `${placeLabel} < ${distanceInput.value}km`;
              omgevingNaam.style.display = 'inline-flex';
            }

            updateURLWithParams(distanceInput.value, placeLabel, placeId, userLat, userLng);
            if (DEBUG) console.log('filter — resolved via Google');
            if (publicJoblist) publicJoblist.triggerHook('filter');
          }
        );
      }
    );
  }

  // ── Distance / Radius Logic ──

  // Finds data-lat/data-lng on the element itself or on a direct child
  function getLatLng(el) {
    const source = el.hasAttribute('data-lat') ? el : el.querySelector('[data-lat]');
    if (!source) return null;
    const lat = parseFloat(source.getAttribute('data-lat'));
    const lng = parseFloat(source.getAttribute('data-lng'));
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  }

  function isItemInRadius(element) {
    const coords = getLatLng(element);
    if (!coords) return false;
    const { lat: itemLat, lng: itemLng } = coords;
    if (userLat == null || userLng == null || !placeLabel) return false;

    const locatieEl = element.querySelector('#locatie');
    const locatie = locatieEl ? locatieEl.getAttribute('locatie') : '';

    const distance = distanceInKmBetweenEarthCoordinates(
      userLat, userLng, itemLat, itemLng
    );
    element.setAttribute('data-distance', distance);

    if (locatieEl) {
      const isSame = locatie === placeLabel;
      locatieEl.innerText = isSame ?
        `In ${placeLabel}, max ${Math.round(distance)} km` :
        `${locatie} is ${Math.round(distance)}km van ${placeLabel}`;
    }

    return distance <= parseFloat(distanceInput.value || '0');
  }

  // ── Mapbox Setup (lazy via IntersectionObserver) ──

  const mapContainer =
    document.querySelector('[data-target="map-container"]') ||
    document.querySelector('.map-jobs_container');

  if (mapContainer) {
    const io = new IntersectionObserver(
      (entries) => {
        if (mapInitialized) return;
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        initMap();
        mapInitialized = true;
        io.disconnect();
      }, { threshold: 0.01 }
    );
    io.observe(mapContainer);
  }

  function initMap() {
    if (typeof mapboxgl === 'undefined') {
      console.error('jobs.js: mapboxgl not loaded, skipping map.');
      return;
    }
    mapboxgl.accessToken = mapboxToken;
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [4.8952, 52.3702],
      zoom: 7,
      scrollZoom: false,
    });

    let mapActive = false;

    map.getContainer().addEventListener('mousedown', () => {
      mapActive = true;
      map.scrollZoom.enable();
    });

    map.getContainer().addEventListener('mouseleave', () => {
      mapActive = false;
      map.scrollZoom.disable();
    });

    map.getContainer().addEventListener('wheel', (e) => {
      if (mapActive) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, { passive: false });

    window.lazyLoadedMap = map;
    addMapMarkers(filteredJobList);
  }

  function clearMapMarkers() {
    markers.forEach((marker) => marker.remove());
    markers = [];
  }

  function addMapMarkers(items) {
    if (!map) return;
    clearMapMarkers();

    const grouped = {};
    items.forEach((item) => {
      const el = item.element;
      const coords = getLatLng(el);
      if (!coords) return;
      const { lat, lng } = coords;
      const key = `${lat},${lng}`;
      if (!grouped[key]) grouped[key] = { lat, lng, jobs: [] };
      grouped[key].jobs.push(item);
    });

    const bounds = new mapboxgl.LngLatBounds();
    let hasMarkers = false;

    Object.values(grouped).forEach(({ lat, lng, jobs }) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerText = jobs.length;

      const popupHTML = jobs
        .map(
          (job) =>
          `<a href="${escapeHTML(job.href || '')}" target="_blank" style="color: inherit; text-decoration: underline;">${escapeHTML(job.fields?.title?.value || '')}</a>`
        )
        .join('<br>');

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML))
        .addTo(map);

      markers.push(marker);
      bounds.extend([lng, lat]);
      hasMarkers = true;
    });

    if (hasMarkers) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }

  // ── Utility Functions ──

  function distanceInKmBetweenEarthCoordinates(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLng = degreesToRadians(lng2 - lng1);
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function degreesToRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  function updateURLWithParams(maxdistance, placeLabel, placeId, lat, lng) {
    const url = new URL(window.location.href);
    const p = url.searchParams;
    maxdistance ? p.set('maxdistance', maxdistance) : p.delete('maxdistance');
    placeLabel ? p.set('place', placeLabel) : p.delete('place');
    placeId ? p.set('placeId', placeId) : p.delete('placeId');
    lat != null ? p.set('lat', String(lat)) : p.delete('lat');
    lng != null ? p.set('lng', String(lng)) : p.delete('lng');
    window.history.replaceState({}, '', `${url.pathname}?${p}`);
  }
})();
}); // DOMContentLoaded
