import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Check, MapPin, Search, Loader2 } from 'lucide-react';
import { useLocationStore, type LocationData } from '@/store/locationStore';

// Falls back to the office the mobile app used to hardcode.
const DEFAULT_CENTER: [number, number] = [7.0731, 125.6128];
const DEFAULT_RADIUS = 150;

type Draft = {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
};

const emptyDraft = (): Draft => ({
  name: '',
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
  radius: DEFAULT_RADIUS,
  is_active: true,
});

/** Turns a map click into the geofence center. */
const ClickToPlace = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
};

/** Pans the map when the draft center changes from outside (search, edit). */
const Recenter = ({ center, zoom }: { center: [number, number]; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom());
  }, [center[0], center[1], zoom]);
  return null;
};

type SearchResult = { display_name: string; lat: string; lon: string };

const LocationsView = () => {
  const { locations, isLoading, error, fetchLocations, createLocation, updateLocation, deleteLocation } =
    useLocationStore();

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const center = useMemo<[number, number]>(() => [draft.latitude, draft.longitude], [draft.latitude, draft.longitude]);

  const openCreate = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (location: LocationData) => {
    setDraft({
      name: location.name,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      radius: location.radius,
      is_active: location.is_active,
    });
    setEditingId(location.id);
    setFormError(null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setResults([]);
    setQuery('');
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setFormError('Give the location a name.');
      return;
    }
    setFormError(null);

    const payload = {
      name: draft.name.trim(),
      latitude: Number(draft.latitude.toFixed(6)),
      longitude: Number(draft.longitude.toFixed(6)),
      radius: Math.round(draft.radius),
      is_active: draft.is_active,
    };

    const saved = editingId ? await updateLocation(editingId, payload) : await createLocation(payload);
    if (saved) closeEditor();
  };

  // Nominatim asks for no more than one request a second, so debounce hard.
  const runSearch = useCallback((value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 3) {
      setResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`,
          { headers: { Accept: 'application/json' } },
        );
        setResults(response.ok ? await response.json() : []);
      } catch (searchError) {
        console.error('Address search failed:', searchError);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 600);
  }, []);

  const renderLocationItems = () => {
    if (isLoading && locations.length === 0) {
      return [...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ));
    }

    if (!Array.isArray(locations) || locations.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No locations yet. Until you add one, employees can clock in from anywhere.
        </div>
      );
    }

    return locations.map((location) => (
      <div
        key={location.id}
        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{location.name}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                location.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {location.is_active ? 'Enforced' : 'Disabled'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)} · {location.radius}m radius
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => updateLocation(location.id, { is_active: !location.is_active })}
            variant="outline"
            size="sm"
            className="text-gray-600"
            disabled={isLoading}
          >
            {location.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button
            onClick={() => openEdit(location)}
            variant="outline"
            size="icon"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
            disabled={isLoading}
          >
            <Pencil className="w-5 h-5" />
          </Button>
          <Button
            onClick={async () => {
              if (window.confirm(`Delete "${location.name}"? Employees will no longer be able to clock in here.`)) {
                await deleteLocation(location.id);
              }
            }}
            variant="outline"
            size="icon"
            className="text-red-600 border-red-300 hover:bg-red-50"
            disabled={isLoading}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Work Locations</h1>
            <p className="text-sm text-gray-500">
              Employees can only clock in and out while inside one of the enforced areas.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={openCreate}
            className="px-4 py-2 border bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Location
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-red-600 bg-red-50 border border-red-200 rounded-md text-sm">{error}</div>
        )}

        {/* Editor */}
        {isEditorOpen && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-lg text-gray-800">
                {editingId ? 'Edit location' : 'New location'}
              </span>
              <Button onClick={closeEditor} variant="outline" size="icon" className="text-gray-500">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. Head Office"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Find an address</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        runSearch(e.target.value);
                      }}
                      placeholder="Search a place or address"
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  {results.length > 0 && (
                    <ul className="mt-1 border border-gray-200 rounded-md divide-y divide-gray-100 max-h-44 overflow-y-auto bg-white">
                      {results.map((result) => (
                        <li key={`${result.lat}-${result.lon}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setDraft({
                                ...draft,
                                latitude: Number(result.lat),
                                longitude: Number(result.lon),
                              });
                              setResults([]);
                              setQuery(result.display_name);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {result.display_name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Radius: <span className="font-semibold">{Math.round(draft.radius)}m</span>
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={2000}
                    step={10}
                    value={draft.radius}
                    onChange={(e) => setDraft({ ...draft, radius: Number(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Keep it generous enough for GPS drift indoors — 100m or more is typical.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={draft.latitude}
                      onChange={(e) => setDraft({ ...draft, latitude: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={draft.longitude}
                      onChange={(e) => setDraft({ ...draft, longitude: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                    className="w-4 h-4 accent-teal-500"
                  />
                  Enforce this location for clock-in
                </label>

                {formError && (
                  <div className="p-3 text-red-600 bg-red-50 border border-red-200 rounded-md text-sm">{formError}</div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg shadow hover:shadow-md"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {editingId ? 'Save changes' : 'Create location'}
                  </Button>
                  <Button onClick={closeEditor} variant="outline" className="text-gray-600">
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  Click anywhere on the map to move the center of the area.
                </div>
                <div className="h-[420px] rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer center={center} zoom={16} scrollWheelZoom className="h-full w-full">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ClickToPlace onPick={(lat, lng) => setDraft({ ...draft, latitude: lat, longitude: lng })} />
                    <Recenter center={center} />
                    <Circle
                      center={center}
                      radius={draft.radius}
                      pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.15 }}
                    />
                    <CircleMarker
                      center={center}
                      radius={5}
                      pathOptions={{ color: '#0f766e', fillColor: '#0f766e', fillOpacity: 1 }}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location list */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">All Locations</div>
          <div className="p-6 space-y-3">{renderLocationItems()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LocationsView;
