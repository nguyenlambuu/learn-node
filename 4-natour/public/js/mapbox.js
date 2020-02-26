/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log('Hi there 🤝');
console.log(locations);

mapboxgl.accessToken =
	'pk.eyJ1IjoiYnV1bG4tZGV2IiwiYSI6ImNrNzJseWJ5cjAzcW4za3V1dWhpN2dmZm0ifQ.lqsIinyNM4eBOInxXo1Afg';

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/buuln-dev/ck72mb8mu1h461hmszamfpqgd',
	scrollZoom: false
	// center: [-118.333515, 34.006377],
	// interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(l => {
	// Create marker
	const element = document.createElement('div');
	element.className = 'marker';
	// Add marker
	new mapboxgl.Marker({ element, anchor: 'bottom' })
		.setLngLat(l.coordinates)
		.addTo(map);

	// Add popup
	new mapboxgl.Popup({ offset: 30 })
		.setLngLat(l.coordinates)
		.setHTML(`<p>Day ${l.day}: ${l.description}</p>`)
		.addTo(map);
	// Extend map bound to include current locations.
	bounds.extend(l.coordinates);
});

map.fitBounds(bounds, {
	padding: {
		top: 200,
		bottom: 200,
		left: 100,
		right: 100
	}
});
