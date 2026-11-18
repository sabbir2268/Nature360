import { useMemo, useState } from "react";
import { Crosshair, MapPin } from "lucide-react";
import LeafletMap from "./LeafletMap";
import { hasCoordinates } from "../../utils/geo";

function LocationPicker({ value, onChange, height = "320px", label = "Pin the exact location" }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const markers = useMemo(() => {
    if (!hasCoordinates(value)) return [];
    return [
      {
        lat: value.lat,
        lng: value.lng,
        color: "#1f7a48",
        radius: 10,
        label: "Complaint location",
      },
    ];
  }, [value]);

  const handleLocate = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
        });
        setLocating(false);
      },
      () => {
        setError("We could not access your location. You can still tap the map to place a pin.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-[11px] font-bold text-forest-900">{label}</label>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
        >
          <Crosshair className="h-3 w-3" />
          {locating ? "Locating..." : "Use my location"}
        </button>
      </div>

      <LeafletMap
        markers={markers}
        height={height}
        fitToMarkers={Boolean(markers.length)}
        onMapClick={({ lat, lng }) => onChange({ lat, lng })}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <MapPin className="h-3 w-3 text-emerald-600" />
          {hasCoordinates(value)
            ? `${Number(value.lat).toFixed(5)}, ${Number(value.lng).toFixed(5)}${value.accuracy ? ` (${value.accuracy} m)` : ""}`
            : "Tap the map to attach GPS coordinates, or use your current location."}
        </p>
        {hasCoordinates(value) && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] font-bold text-rose-600 hover:underline"
          >
            Clear pin
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-[10px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export default LocationPicker;
