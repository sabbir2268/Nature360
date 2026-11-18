import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "../../utils/cn";
import { toCoordinate } from "../../utils/geo";

const DEFAULT_CENTER = [23.8103, 90.4125];

function LeafletMap({
  markers = [],
  center,
  zoom = 12,
  height = "360px",
  className = "",
  onMapClick,
  fitToMarkers = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(center || DEFAULT_CENTER, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    if (onMapClick) {
      map.on("click", (event) => {
        onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
      });
    }

    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // Initialise once; marker updates are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const valid = markers.filter(
      (marker) => toCoordinate(marker.lat) !== null && toCoordinate(marker.lng) !== null,
    );

    valid.forEach((marker) => {
      const circle = L.circleMarker([toCoordinate(marker.lat), toCoordinate(marker.lng)], {
        radius: marker.radius || 9,
        color: marker.color || "#14532d",
        fillColor: marker.color || "#14532d",
        fillOpacity: 0.55,
        weight: 2,
      });

      if (marker.popup) circle.bindPopup(marker.popup);
      circle.addTo(layer);

      if (marker.label) {
        circle.bindTooltip(marker.label, { direction: "top", offset: [0, -6] });
      }

      if (marker.onClick) circle.on("click", marker.onClick);
    });

    if (fitToMarkers && valid.length > 0) {
      if (valid.length === 1) {
        map.setView([Number(valid[0].lat), Number(valid[0].lng)], valid[0].zoom || 14);
      } else {
        const bounds = L.latLngBounds(
          valid.map((marker) => [Number(marker.lat), Number(marker.lng)]),
        );
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
      }
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [markers, center, zoom, fitToMarkers]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={cn("z-0 w-full overflow-hidden rounded-2xl border border-forest-900/10", className)}
      aria-label="Interactive OpenStreetMap"
    />
  );
}

export default LeafletMap;
