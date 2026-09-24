(function () {
  if (window.__nexlaHubSpotListenerInstalled) return;
  window.__nexlaHubSpotListenerInstalled = true;
  window.dataLayer = window.dataLayer || [];
  var completed = Object.create(null);
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || typeof data !== 'object' || data.type !== 'hsFormCallback') return;
    if (typeof data.id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(data.id)) return;
    var trusted = event.source === window && event.origin === window.location.origin;
    var frames = document.querySelectorAll('iframe[src]');
    for (var i = 0; !trusted && i < frames.length; i++) {
      var url;
      try { url = new URL(frames[i].src); } catch (_) { continue; }
      trusted = frames[i].contentWindow === event.source && url.origin === event.origin &&
        url.protocol === 'https:' && /(^|\.)hsforms\.(com|net)$/.test(url.hostname);
    }
    if (!trusted) return;
    if (data.eventName === 'onFormSubmit') {
      // Preserve the existing pre-submit event contract; this is not a conversion.
      window.dataLayer.push({'event': 'hubspot-form-data', 'hs-form-guid': data.id, 'hs-formData': data.data});
    }
    if (data.eventName !== 'onFormSubmitted' || completed[data.id]) return;
    // ponytail: one success per form per page; use submission IDs if repeat submissions matter.
    completed[data.id] = true;
    window.dataLayer.push({'event': 'hubspot-form-success', 'hs-form-guid': data.id});
  });
})();
