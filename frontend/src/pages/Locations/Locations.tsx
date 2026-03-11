import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { MapPin, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import ui from '../../styles/ui.module.css';
import table from '../shared/AdminTable.module.css';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

interface Location {
    id: number;
    name: string;
    country: string;
    city: string;
    locationCode: string;
    latitude: number;
    longitude: number;
}

interface LocationFormState {
    locationCode: string;
    name: string;
    city: string;
    country: string;
    latitude: string;
    longitude: string;
}

const emptyForm = (): LocationFormState => ({
    locationCode: '',
    name: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
});

const mapLocationToForm = (location: Partial<Location>): LocationFormState => ({
    locationCode: location.locationCode ?? '',
    name: location.name ?? '',
    city: location.city ?? '',
    country: location.country ?? '',
    latitude: location.latitude !== undefined ? String(location.latitude) : '',
    longitude: location.longitude !== undefined ? String(location.longitude) : '',
});

export const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<LocationFormState>(emptyForm);
    const [pendingDelete, setPendingDelete] = useState<Location | null>(null);
    const { showToast } = useToast();

    const updateField = (field: keyof LocationFormState, value: string) => {
        setFormData((current) => ({ ...current, [field]: value }));
    };

    const resetEditor = () => {
        setIsEditing(null);
        setIsAdding(false);
        setFormData(emptyForm());
    };

    const loadLocations = async () => {
        try {
            setLoading(true);
            const data = await fetchApi('/locations');
            setLocations(data);
        } catch (err: any) {
            showToast({ title: 'Locations could not load', message: err.message || 'Please try again.', tone: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const validateForm = () => {
        const locationCode = formData.locationCode.trim().toUpperCase();
        const name = formData.name.trim();
        const city = formData.city.trim();
        const country = formData.country.trim();
        const latitude = Number(formData.latitude);
        const longitude = Number(formData.longitude);

        if (!locationCode || !name || !city || !country || formData.latitude.trim() === '' || formData.longitude.trim() === '') {
            throw new Error('Please fill in every location field before saving.');
        }

        if (!/^[A-Z0-9]{3,5}$/.test(locationCode)) {
            throw new Error('Location code must be 3 to 5 uppercase letters or numbers.');
        }

        if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
            throw new Error('Latitude must be a valid number between -90 and 90.');
        }

        if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
            throw new Error('Longitude must be a valid number between -180 and 180.');
        }

        return { locationCode, name, city, country, latitude, longitude };
    };

    const handleSave = async () => {
        try {
            const payload = validateForm();

            if (isEditing) {
                await fetchApi(`/locations/${isEditing}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                showToast({ title: 'Location updated', message: `${payload.name} was updated successfully.`, tone: 'success' });
            } else {
                await fetchApi('/locations', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                showToast({ title: 'Location created', message: `${payload.name} was added successfully.`, tone: 'success' });
            }

            resetEditor();
            await loadLocations();
        } catch (err: any) {
            showToast({ title: 'Location not saved', message: err.message || 'Please review the form fields.', tone: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;

        try {
            await fetchApi(`/locations/${pendingDelete.id}`, { method: 'DELETE' });
            showToast({ title: 'Location deleted', message: `${pendingDelete.name} was removed.`, tone: 'success' });
            setPendingDelete(null);
            await loadLocations();
        } catch (err: any) {
            showToast({ title: 'Delete failed', message: err.message || 'Location could not be deleted.', tone: 'error' });
            setPendingDelete(null);
        }
    };

    if (loading && locations.length === 0) {
        return <div className={ui.loadingState}><Loader2 className={ui.spinner} size={32} /></div>;
    }

    return (
        <>
            <div className={ui.card}>
                <div className={ui.cardHeader}>
                    <div>
                        <h1 className={ui.sectionTitle}><MapPin className={table.accentIcon} /> Manage Locations</h1>
                        <p className={ui.sectionCopy}>Add, edit or delete airport and transfer locations.</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setIsEditing(null);
                            setFormData(emptyForm());
                        }}
                        className={ui.primaryButton}
                    >
                        <Plus size={18} /> Add Location
                    </button>
                </div>

                <div className={table.tableWrapper}>
                    <table className={ui.tableShell}>
                        <thead className={ui.tableHead}>
                            <tr>
                                <th className={table.cell}>Code</th>
                                <th className={table.cell}>Name</th>
                                <th className={table.cell}>City / Country</th>
                                <th className={table.cell}>Coordinates (Lat/Lng)</th>
                                <th className={table.cellRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={table.tableBody}>
                            {isAdding && (
                                <tr className={ui.editRow}>
                                    <td className={table.cell}><input className={cn(ui.inlineInput, table.nowrap)} placeholder="IST" value={formData.locationCode} onChange={(e) => updateField('locationCode', e.target.value.toUpperCase())} /></td>
                                    <td className={table.cell}><input className={ui.inlineInput} placeholder="Istanbul Airport" value={formData.name} onChange={(e) => updateField('name', e.target.value)} /></td>
                                    <td className={cn(table.cell, table.cellFlex)}>
                                        <input className={ui.inlineInput} placeholder="Istanbul" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                                        <input className={ui.inlineInput} placeholder="Turkey" value={formData.country} onChange={(e) => updateField('country', e.target.value)} />
                                    </td>
                                    <td className={table.cell}>
                                        <div className={table.inlineGroup}>
                                            <input type="number" step="0.0001" className={ui.inlineInput} placeholder="Lat" value={formData.latitude} onChange={(e) => updateField('latitude', e.target.value)} />
                                            <input type="number" step="0.0001" className={ui.inlineInput} placeholder="Lng" value={formData.longitude} onChange={(e) => updateField('longitude', e.target.value)} />
                                        </div>
                                    </td>
                                    <td className={table.cellRight}>
                                        <button onClick={handleSave} className={cn(ui.iconButton, ui.iconButtonSuccess)}><Save size={18} /></button>
                                        <button onClick={resetEditor} className={cn(ui.iconButton, ui.iconButtonNeutral)}><X size={18} /></button>
                                    </td>
                                </tr>
                            )}

                            {locations.map((loc) => isEditing === loc.id ? (
                                <tr key={loc.id} className={ui.editRow}>
                                    <td className={table.cell}><input className={cn(ui.inlineInput, table.nowrap)} value={formData.locationCode} onChange={(e) => updateField('locationCode', e.target.value.toUpperCase())} /></td>
                                    <td className={table.cell}><input className={ui.inlineInput} value={formData.name} onChange={(e) => updateField('name', e.target.value)} /></td>
                                    <td className={cn(table.cell, table.cellFlex)}>
                                        <input className={ui.inlineInput} value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                                        <input className={ui.inlineInput} value={formData.country} onChange={(e) => updateField('country', e.target.value)} />
                                    </td>
                                    <td className={table.cell}>
                                        <div className={table.inlineGroup}>
                                            <input type="number" step="0.0001" className={ui.inlineInput} value={formData.latitude} onChange={(e) => updateField('latitude', e.target.value)} />
                                            <input type="number" step="0.0001" className={ui.inlineInput} value={formData.longitude} onChange={(e) => updateField('longitude', e.target.value)} />
                                        </div>
                                    </td>
                                    <td className={cn(table.cellRight, table.nowrap)}>
                                        <button onClick={handleSave} className={cn(ui.iconButton, ui.iconButtonSuccess)}><Save size={18} /></button>
                                        <button onClick={resetEditor} className={cn(ui.iconButton, ui.iconButtonNeutral)}><X size={18} /></button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={loc.id} className={ui.dataRow}>
                                    <td className={table.cell}><span className={table.codeBadge}>{loc.locationCode}</span></td>
                                    <td className={cn(table.cell, table.valueStrong)}>{loc.name}</td>
                                    <td className={table.cell}>{loc.city}, {loc.country}</td>
                                    <td className={cn(table.cell, table.monoValue)}>{loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</td>
                                    <td className={table.cellRight}>
                                        <div className={table.rowActions}>
                                            <button onClick={() => { setIsEditing(loc.id); setIsAdding(false); setFormData(mapLocationToForm(loc)); }} className={cn(ui.iconButton, ui.iconButtonEdit)}><Edit2 size={16} /></button>
                                            <button onClick={() => setPendingDelete(loc)} className={cn(ui.iconButton, ui.iconButtonDelete)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pendingDelete && (
                <ConfirmDialog
                    title="Delete location"
                    message={`Are you sure you want to delete ${pendingDelete.name}? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </>
    );
};
