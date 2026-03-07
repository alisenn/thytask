import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import { Search, Map as MapIcon, Calendar, ArrowRight, Loader2, Info, X, Plane, Bus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
    id: number;
    name: string;
    country: string;
    city: string;
    locationCode: string;
    latitude: number;
    longitude: number;
}

interface RouteLeg {
    origin: Location;
    destination: Location;
    transportationType: string;
}

interface RouteResponse {
    legs: RouteLeg[];
}

export const RoutesPage: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [originId, setOriginId] = useState<string>('');
    const [destinationId, setDestinationId] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const [routes, setRoutes] = useState<RouteResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Drawer State
    const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);

    useEffect(() => {
        fetchApi('/routes/locations')
            .then(setLocations)
            .catch((err: Error) => setError(err.message || 'Failed to load locations'));
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originId || !destinationId || !date) return;

        setLoading(true);
        setError(null);
        setSearched(true);
        setSelectedRoute(null);

        try {
            const data = await fetchApi(`/routes?originId=${originId}&destinationId=${destinationId}&date=${date}`);
            setRoutes(data);
        } catch (err: any) {
            setError(err.message);
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    const renderMap = (route: RouteResponse) => {
        if (!route || route.legs.length === 0) return null;

        const firstLoc = route.legs[0].origin;
        const center: [number, number] = [firstLoc.latitude, firstLoc.longitude];

        const bounds = L.latLngBounds(route.legs.map(l => [l.origin.latitude, l.origin.longitude]));
        const lastLoc = route.legs[route.legs.length - 1].destination;
        bounds.extend([lastLoc.latitude, lastLoc.longitude]);

        return (
            <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 z-0 relative mt-6">
                <MapContainer center={center} zoom={5} bounds={bounds} boundsOptions={{ padding: [50, 50] }} className="h-full w-full z-0">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Markers */}
                    {route.legs.map((leg, idx) => (
                        <React.Fragment key={idx}>
                            <Marker position={[leg.origin.latitude, leg.origin.longitude]}>
                                <Popup><b>{leg.origin.locationCode}</b><br />{leg.origin.name}</Popup>
                            </Marker>
                            {idx === route.legs.length - 1 && (
                                <Marker position={[leg.destination.latitude, leg.destination.longitude]}>
                                    <Popup><b>{leg.destination.locationCode}</b><br />{leg.destination.name}</Popup>
                                </Marker>
                            )}

                            {/* Polyline */}
                            <Polyline
                                positions={[
                                    [leg.origin.latitude, leg.origin.longitude],
                                    [leg.destination.latitude, leg.destination.longitude]
                                ]}
                                color={leg.transportationType === 'FLIGHT' ? '#ef4444' : '#3b82f6'} // Red for flight, Blue for transfers
                                weight={3}
                                dashArray={leg.transportationType === 'FLIGHT' ? '1, 0' : '5, 5'}
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>
        );
    };

    return (
        <div className="space-y-6 relative">
            {/* Search Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 md:p-8">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                    <MapIcon className="text-red-500" size={32} />
                    Find Your Journey
                </h1>

                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600">Origin</label>
                        <select required value={originId} onChange={e => setOriginId(e.target.value)} className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 border focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors">
                            <option value="">Select Origin</option>
                            {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.city} ({l.locationCode})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600">Destination</label>
                        <select required value={destinationId} onChange={e => setDestinationId(e.target.value)} className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 border focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors">
                            <option value="">Select Destination</option>
                            {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.city} ({l.locationCode})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border-slate-200 rounded-lg p-3 pl-10 bg-slate-50 border focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg p-3 font-bold flex justify-center items-center gap-2 transition-colors shadow-lg shadow-red-500/30">
                            {loading ? <Loader2 className="animate-spin" /> : <Search />} Search Routes
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Area */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 font-medium">
                    {error}
                </div>
            )}

            {searched && !loading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                    <h2 className="text-xl font-bold mb-4">Available Routes ({routes.length})</h2>

                    {routes.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Info className="mx-auto mb-2 opacity-50" size={32} />
                            <p>No valid routes found for these locations on the selected date.</p>
                            <p className="text-sm mt-1">Remember: Valid routes must include exactly one flight.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {routes.map((route: RouteResponse, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedRoute(route)}
                                    className={`cursor-pointer rounded-xl border-2 transition-all p-5 hover:shadow-md ${selectedRoute === route ? 'border-red-500 bg-red-50/20' : 'border-slate-100 hover:border-red-300'}`}
                                >
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {route.legs.map((leg: RouteLeg, i: number) => (
                                            <React.Fragment key={i}>
                                                <span className="font-bold whitespace-nowrap">{leg.origin.locationCode}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${leg.transportationType === 'FLIGHT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {leg.transportationType}
                                                </span>
                                                {i === route.legs.length - 1 && (
                                                    <>
                                                        <ArrowRight size={14} className="text-slate-400" />
                                                        <span className="font-bold">{leg.destination.locationCode}</span>
                                                    </>
                                                )}
                                                {i < route.legs.length - 1 && <ArrowRight size={14} className="text-slate-400" />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {route.legs.length} connection(s) • Contains 1 Flight
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Side Panel Drawer for Route Details */}
            {selectedRoute && (
                <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 flex flex-col border-l border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-2xl font-bold">Route Details</h2>
                        <button onClick={() => setSelectedRoute(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">

                            {selectedRoute.legs.map((leg: RouteLeg, idx: number) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        {leg.transportationType === 'FLIGHT' ? <Plane size={16} className="text-red-500" /> : <Bus size={16} />}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${leg.transportationType === 'FLIGHT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{leg.transportationType}</span>
                                        </div>
                                        <div className="font-bold text-slate-800">{leg.origin.name}</div>
                                        <div className="text-slate-400 text-sm mb-2">({leg.origin.locationCode})</div>
                                        <div className="flex justify-center my-2 text-slate-300"><ArrowRight size={16} /></div>
                                        <div className="font-bold text-slate-800">{leg.destination.name}</div>
                                        <div className="text-slate-400 text-sm">({leg.destination.locationCode})</div>
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Map Integration */}
                        {renderMap(selectedRoute)}
                        <div className="mt-4 text-xs text-slate-400 text-center">
                            * Red dashed lines denote flights, blue dashed lines denote transfers.
                        </div>

                    </div>
                </div>
            )}

            {/* Backdrop for Drawer */}
            {selectedRoute && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedRoute(null)}></div>
            )}
        </div>
    );
};
