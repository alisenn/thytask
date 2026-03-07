import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import { MapPin, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';

interface Location {
    id: number;
    name: string;
    country: string;
    city: string;
    locationCode: string;
    latitude: number;
    longitude: number;
}

export const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Location>>({});

    const loadLocations = async () => {
        try {
            setLoading(true);
            const data = await fetchApi('/locations');
            setLocations(data);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const handleSave = async () => {
        try {
            if (isEditing) {
                await fetchApi(`/locations/${isEditing}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchApi('/locations', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setIsEditing(null);
            setIsAdding(false);
            setFormData({});
            loadLocations();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            await fetchApi(`/locations/${id}`, { method: 'DELETE' });
            loadLocations();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading && locations.length === 0) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-red-500" size={32} /></div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="text-red-500" /> Manage Locations</h1>
                    <p className="text-slate-500 text-sm mt-1">Add, edit or delete airport and transfer locations.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setFormData({ latitude: 0, longitude: 0 }); setIsEditing(null); }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Add Location
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">City / Country</th>
                            <th className="px-6 py-4">Coordinates (Lat/Lng)</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isAdding && (
                            <tr className="bg-red-50/50">
                                <td className="px-6 py-4"><input className="border rounded p-1 w-20 uppercase" placeholder="IST" value={formData.locationCode || ''} onChange={e => setFormData({ ...formData, locationCode: e.target.value.toUpperCase() })} /></td>
                                <td className="px-6 py-4"><input className="border rounded p-1 w-full" placeholder="Istanbul Airport" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></td>
                                <td className="px-6 py-4 flex gap-2">
                                    <input className="border rounded p-1 w-24" placeholder="Istanbul" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    <input className="border rounded p-1 w-24" placeholder="Turkey" value={formData.country || ''} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <input type="number" step="0.0001" className="border rounded p-1 w-20" placeholder="Lat" value={formData.latitude || ''} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} />
                                        <input type="number" step="0.0001" className="border rounded p-1 w-20" placeholder="Lng" value={formData.longitude || ''} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-2 rounded-lg mr-2"><Save size={18} /></button>
                                    <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg"><X size={18} /></button>
                                </td>
                            </tr>
                        )}

                        {locations.map((loc) => isEditing === loc.id ? (
                            <tr key={loc.id} className="bg-red-50/50">
                                <td className="px-6 py-4"><input className="border rounded p-1 w-20 uppercase" value={formData.locationCode} onChange={e => setFormData({ ...formData, locationCode: e.target.value.toUpperCase() })} /></td>
                                <td className="px-6 py-4"><input className="border rounded p-1 w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></td>
                                <td className="px-6 py-4 flex gap-2">
                                    <input className="border rounded p-1 w-24" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    <input className="border rounded p-1 w-24" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <input type="number" step="0.0001" className="border rounded p-1 w-20" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} />
                                        <input type="number" step="0.0001" className="border rounded p-1 w-20" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-2 rounded-lg mr-1"><Save size={18} /></button>
                                    <button onClick={() => setIsEditing(null)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg"><X size={18} /></button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{loc.locationCode}</span></td>
                                <td className="px-6 py-4 font-medium">{loc.name}</td>
                                <td className="px-6 py-4">{loc.city}, {loc.country}</td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-1">
                                    <button onClick={() => { setIsEditing(loc.id); setFormData(loc); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(loc.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
