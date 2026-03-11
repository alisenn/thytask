import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../services/api';
import { Search, Map as MapIcon, Calendar, ArrowRight, Loader2, Info, X, Plane, Bus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../../utils/cn';
import ui from '../../styles/ui.module.css';
import styles from './Routes.module.css';

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

const getConnectionCountLabel = (legs: RouteLeg[]) => {
    const connections = Math.max(legs.length - 1, 0);
    return `${connections} connection${connections === 1 ? '' : 's'}`;
};

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
            <div className={styles.mapFrame}>
                <MapContainer center={center} zoom={5} bounds={bounds} boundsOptions={{ padding: [50, 50] }} className={styles.mapCanvas}>
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
                                color={leg.transportationType === 'FLIGHT' ? '#ef4444' : '#3b82f6'}
                                weight={3}
                                dashArray={leg.transportationType === 'FLIGHT' ? undefined : '5, 5'}
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>
        );
    };

    return (
        <div className={styles.page}>
            <div className={cn(ui.card, styles.searchCard)}>
                <h1 className={styles.title}>
                    <MapIcon className={styles.titleIcon} size={32} />
                    Find Your Journey
                </h1>

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.fieldGroup}>
                        <label className={ui.formLabel}>Origin</label>
                        <select required value={originId} onChange={e => setOriginId(e.target.value)} className={ui.field}>
                            <option value="">Select Origin</option>
                            {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.city} ({l.locationCode})</option>)}
                        </select>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={ui.formLabel}>Destination</label>
                        <select required value={destinationId} onChange={e => setDestinationId(e.target.value)} className={ui.field}>
                            <option value="">Select Destination</option>
                            {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.city} ({l.locationCode})</option>)}
                        </select>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={ui.formLabel}>Date</label>
                        <div className={styles.dateWrap}>
                            <Calendar className={styles.dateIcon} size={18} />
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={cn(ui.field, ui.fieldWithIcon)} />
                        </div>
                    </div>
                    <div className={styles.submitCell}>
                        <button type="submit" disabled={loading} className={cn(ui.primaryButton, ui.primaryButtonWide)}>
                            {loading ? <Loader2 className={ui.spinner} /> : <Search />} Search Routes
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className={styles.errorBox}>
                    {error}
                </div>
            )}

            {searched && !loading && !error && (
                <div className={cn(ui.card, styles.resultsCard)}>
                    <h2 className={styles.resultsTitle}>Available Routes ({routes.length})</h2>

                    {routes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Info className={styles.emptyIcon} size={32} />
                            <p>No valid routes found for these locations on the selected date.</p>
                            <p className={styles.emptyHint}>Remember: Valid routes must include exactly one flight.</p>
                        </div>
                    ) : (
                        <div className={styles.routeGrid}>
                            {routes.map((route: RouteResponse, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedRoute(route)}
                                    className={cn(styles.routeCard, selectedRoute === route && styles.routeCardSelected)}
                                >
                                    <div className={styles.routeLegs}>
                                        {route.legs.map((leg: RouteLeg, i: number) => (
                                            <React.Fragment key={i}>
                                                <span className={styles.routeCode}>{leg.origin.locationCode}</span>
                                                <span className={leg.transportationType === 'FLIGHT' ? ui.transportPillFlight : ui.transportPillNeutral}>
                                                    {leg.transportationType}
                                                </span>
                                                {i === route.legs.length - 1 && (
                                                    <>
                                                        <ArrowRight size={14} className={styles.routeArrow} />
                                                        <span className={styles.routeCode}>{leg.destination.locationCode}</span>
                                                    </>
                                                )}
                                                {i < route.legs.length - 1 && <ArrowRight size={14} className={styles.routeArrow} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className={styles.routeMeta}>
                                        {getConnectionCountLabel(route.legs)} • Contains 1 flight
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedRoute && (
                <div className={styles.drawer}>
                    <div className={styles.drawerHeader}>
                        <h2 className={styles.drawerTitle}>Route Details</h2>
                        <button onClick={() => setSelectedRoute(null)} className={styles.closeButton}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.drawerBody}>
                        <div className={styles.timeline}>

                            {selectedRoute.legs.map((leg: RouteLeg, idx: number) => (
                                <div key={idx} className={styles.timelineItem}>
                                    <div className={styles.timelineNode}>
                                        {leg.transportationType === 'FLIGHT' ? <Plane size={16} className={styles.flightIcon} /> : <Bus size={16} />}
                                    </div>
                                    <div className={styles.timelineCard}>
                                        <div className={styles.timelineCardHeader}>
                                            <span className={leg.transportationType === 'FLIGHT' ? ui.transportPillFlight : ui.transportPillNeutral}>{leg.transportationType}</span>
                                        </div>
                                        <div className={styles.legName}>{leg.origin.name}</div>
                                        <div className={styles.legCode}>({leg.origin.locationCode})</div>
                                        <div className={styles.legArrow}><ArrowRight size={16} /></div>
                                        <div className={styles.legName}>{leg.destination.name}</div>
                                        <div className={styles.legCode}>({leg.destination.locationCode})</div>
                                    </div>
                                </div>
                            ))}

                        </div>

                        {renderMap(selectedRoute)}
                        <div className={styles.mapNote}>
                            * Red solid lines denote flights, blue dashed lines denote transfers.
                        </div>

                    </div>
                </div>
            )}

            {selectedRoute && (
                <div className={styles.backdrop} onClick={() => setSelectedRoute(null)}></div>
            )}
        </div>
    );
};
