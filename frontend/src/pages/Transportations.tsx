import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import { Bus, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';

interface Location {
    id: number;
    name: string;
    locationCode: string;
}

interface Transportation {
    id: number;
    originLocation: Location;
    destinationLocation: Location;
    type: 'FLIGHT' | 'BUS' | 'SUBWAY' | 'UBER';
    operatingDays: number[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TransportationsPage: React.FC = () => {
    const [transportations, setTransportations] = useState<Transportation[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<any>({ operatingDays: [] });

    const loadData = async () => {
        try {
            setLoading(true);
            const [transData, locData] = await Promise.all([
                fetchApi('/transportations'),
                fetchApi('/locations')
            ]);
            setTransportations(transData);
            setLocations(locData);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDayToggle = (dayNum: number) => {
        const currentDays = formData.operatingDays || [];
        const newDays = currentDays.includes(dayNum)
            ? currentDays.filter((d: number) => d !== dayNum)
            : [...currentDays, dayNum];
        setFormData({ ...formData, operatingDays: newDays });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                originLocationId: formData.originLocationId || formData.originLocation?.id,
                destinationLocationId: formData.destinationLocationId || formData.destinationLocation?.id
            };

            if (isEditing) {
                await fetchApi(`/transportations/${isEditing}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await fetchApi('/transportations', { method: 'POST', body: JSON.stringify(payload) });
            }
            setIsEditing(null);
            setIsAdding(false);
            setFormData({ operatingDays: [] });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this transportation?')) return;
        try {
            await fetchApi(`/transportations/${id}`, { method: 'DELETE' });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading && transportations.length === 0) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-red-500" size={32} /></div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Bus className="text-red-500" /> Manage Transportations</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure flights and transfers between locations.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setFormData({ type: 'FLIGHT', operatingDays: [] }); setIsEditing(null); }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Add Transport
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Origin</th>
                            <th className="px-6 py-4">Destination</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Operating Days</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isAdding && (
                            <tr className="bg-red-50/50">
                                <td className="px-6 py-4">
                                    <select className="border rounded-md p-2 w-full bg-white" onChange={e => setFormData({ ...formData, originLocationId: parseInt(e.target.value) })}>
                                        <option value="">Select Origin...</option>
                                        {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select className="border rounded-md p-2 w-full bg-white" onChange={e => setFormData({ ...formData, destinationLocationId: parseInt(e.target.value) })}>
                                        <option value="">Select Dest...</option>
                                        {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select className="border rounded-md p-2 w-full font-semibold bg-white" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="FLIGHT">FLIGHT</option>
                                        <option value="BUS">BUS</option>
                                        <option value="SUBWAY">SUBWAY</option>
                                        <option value="UBER">UBER</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {DAYS.map((d, i) => (
                                            <button key={i} onClick={() => handleDayToggle(i + 1)} className={`px-2 py-1 text-xs rounded border transition-colors ${formData.operatingDays?.includes(i + 1) ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-500'}`}>{d}</button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-2 rounded-lg mr-2"><Save size={18} /></button>
                                    <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg"><X size={18} /></button>
                                </td>
                            </tr>
                        )}

                        {transportations.map((t: Transportation) => isEditing === t.id ? (
                            <tr key={t.id} className="bg-red-50/50">
                                <td className="px-6 py-4">
                                    <select className="border rounded-md p-2 w-full bg-white" value={formData.originLocationId || t.originLocation.id} onChange={e => setFormData({ ...formData, originLocationId: parseInt(e.target.value) })}>
                                        {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select className="border rounded-md p-2 w-full bg-white" value={formData.destinationLocationId || t.destinationLocation.id} onChange={e => setFormData({ ...formData, destinationLocationId: parseInt(e.target.value) })}>
                                        {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select className="border rounded-md p-2 w-full font-semibold bg-white" value={formData.type || t.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="FLIGHT">FLIGHT</option>
                                        <option value="BUS">BUS</option>
                                        <option value="SUBWAY">SUBWAY</option>
                                        <option value="UBER">UBER</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {DAYS.map((d, i) => (
                                            <button key={i} onClick={() => handleDayToggle(i + 1)} className={`px-2 py-1 text-xs rounded border transition-colors ${(formData.operatingDays || t.operatingDays)?.includes(i + 1) ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-500'}`}>{d}</button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-2 rounded-lg mr-2"><Save size={18} /></button>
                                    <button onClick={() => setIsEditing(null)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg"><X size={18} /></button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{t.originLocation.name} <span className="text-slate-400 text-xs">({t.originLocation.locationCode})</span></td>
                                <td className="px-6 py-4 font-medium text-slate-800">{t.destinationLocation.name} <span className="text-slate-400 text-xs">({t.destinationLocation.locationCode})</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'FLIGHT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-1 flex-wrap">
                                    {DAYS.map((d, i) => (
                                        <span key={i} className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${t.operatingDays?.includes(i + 1) ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-300'}`}>{d.charAt(0)}</span>
                                    ))}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => { setIsEditing(t.id); setFormData(t); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
