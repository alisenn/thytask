import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { Bus, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import ui from '../../styles/ui.module.css';
import table from '../shared/AdminTable.module.css';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

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

interface TransportationFormState {
    originLocationId: string;
    destinationLocationId: string;
    type: Transportation['type'];
    operatingDays: number[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const emptyForm = (): TransportationFormState => ({
    originLocationId: '',
    destinationLocationId: '',
    type: 'FLIGHT',
    operatingDays: [],
});

const mapTransportationToForm = (transportation: Transportation): TransportationFormState => ({
    originLocationId: String(transportation.originLocation.id),
    destinationLocationId: String(transportation.destinationLocation.id),
    type: transportation.type,
    operatingDays: [...transportation.operatingDays],
});

export const TransportationsPage: React.FC = () => {
    const [transportations, setTransportations] = useState<Transportation[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<TransportationFormState>(emptyForm);
    const [pendingDelete, setPendingDelete] = useState<Transportation | null>(null);
    const { showToast } = useToast();

    const resetEditor = () => {
        setIsEditing(null);
        setIsAdding(false);
        setFormData(emptyForm());
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [transData, locData] = await Promise.all([
                fetchApi('/transportations'),
                fetchApi('/locations'),
            ]);
            setTransportations(transData);
            setLocations(locData);
        } catch (err: any) {
            showToast({ title: 'Transportations could not load', message: err.message || 'Please try again.', tone: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDayToggle = (dayNum: number) => {
        setFormData((current) => ({
            ...current,
            operatingDays: current.operatingDays.includes(dayNum)
                ? current.operatingDays.filter((day) => day !== dayNum)
                : [...current.operatingDays, dayNum].sort((a, b) => a - b),
        }));
    };

    const validateForm = () => {
        const originLocationId = Number(formData.originLocationId);
        const destinationLocationId = Number(formData.destinationLocationId);

        if (!formData.originLocationId || !formData.destinationLocationId) {
            throw new Error('Please choose both origin and destination locations.');
        }

        if (Number.isNaN(originLocationId) || Number.isNaN(destinationLocationId)) {
            throw new Error('Selected locations are invalid. Please choose them again.');
        }

        if (originLocationId === destinationLocationId) {
            throw new Error('Origin and destination cannot be the same location.');
        }

        if (formData.operatingDays.length === 0) {
            throw new Error('Please choose at least one operating day.');
        }

        return {
            originLocationId,
            destinationLocationId,
            type: formData.type,
            operatingDays: formData.operatingDays,
        };
    };

    const handleSave = async () => {
        try {
            const payload = validateForm();

            if (isEditing) {
                await fetchApi(`/transportations/${isEditing}`, { method: 'PUT', body: JSON.stringify(payload) });
                showToast({ title: 'Transportation updated', message: 'The route leg was updated successfully.', tone: 'success' });
            } else {
                await fetchApi('/transportations', { method: 'POST', body: JSON.stringify(payload) });
                showToast({ title: 'Transportation created', message: 'The route leg was added successfully.', tone: 'success' });
            }

            resetEditor();
            await loadData();
        } catch (err: any) {
            showToast({ title: 'Transportation not saved', message: err.message || 'Please review the form fields.', tone: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;

        try {
            await fetchApi(`/transportations/${pendingDelete.id}`, { method: 'DELETE' });
            showToast({ title: 'Transportation deleted', message: 'The route leg was removed.', tone: 'success' });
            setPendingDelete(null);
            await loadData();
        } catch (err: any) {
            showToast({ title: 'Delete failed', message: err.message || 'Transportation could not be deleted.', tone: 'error' });
            setPendingDelete(null);
        }
    };

    if (loading && transportations.length === 0) {
        return <div className={ui.loadingState}><Loader2 className={ui.spinner} size={32} /></div>;
    }

    return (
        <>
            <div className={ui.card}>
                <div className={cn(ui.cardHeader, table.headerMuted)}>
                    <div>
                        <h1 className={ui.sectionTitle}><Bus className={table.accentIcon} /> Manage Transportations</h1>
                        <p className={ui.sectionCopy}>Configure flights and transfers between locations.</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setIsEditing(null);
                            setFormData(emptyForm());
                        }}
                        className={ui.primaryButton}
                    >
                        <Plus size={18} /> Add Transport
                    </button>
                </div>

                <div className={table.tableWrapper}>
                    <table className={ui.tableShell}>
                        <thead className={cn(ui.tableHead, table.headerMuted)}>
                            <tr>
                                <th className={table.cell}>Origin</th>
                                <th className={table.cell}>Destination</th>
                                <th className={table.cell}>Type</th>
                                <th className={table.cell}>Operating Days</th>
                                <th className={table.cellRight}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={table.tableBody}>
                            {isAdding && (
                                <tr className={ui.editRow}>
                                    <td className={table.cell}>
                                        <select className={ui.inlineSelect} value={formData.originLocationId} onChange={(e) => setFormData({ ...formData, originLocationId: e.target.value })}>
                                            <option value="">Select Origin...</option>
                                            {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                        </select>
                                    </td>
                                    <td className={table.cell}>
                                        <select className={ui.inlineSelect} value={formData.destinationLocationId} onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}>
                                            <option value="">Select Destination...</option>
                                            {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                        </select>
                                    </td>
                                    <td className={table.cell}>
                                        <select className={cn(ui.inlineSelect, table.selectStrong)} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Transportation['type'] })}>
                                            <option value="FLIGHT">FLIGHT</option>
                                            <option value="BUS">BUS</option>
                                            <option value="SUBWAY">SUBWAY</option>
                                            <option value="UBER">UBER</option>
                                        </select>
                                    </td>
                                    <td className={table.cell}>
                                        <div className={table.dayList}>
                                            {DAYS.map((d, i) => (
                                                <button key={i} type="button" onClick={() => handleDayToggle(i + 1)} className={cn(ui.dayToggle, formData.operatingDays.includes(i + 1) && ui.dayToggleActive)}>{d}</button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className={table.cellRight}>
                                        <div className={table.rowActions}>
                                            <button onClick={handleSave} className={cn(ui.iconButton, ui.iconButtonSuccess)}><Save size={18} /></button>
                                            <button onClick={resetEditor} className={cn(ui.iconButton, ui.iconButtonNeutral)}><X size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {transportations.map((t) => isEditing === t.id ? (
                                <tr key={t.id} className={ui.editRow}>
                                    <td className={table.cell}>
                                        <select className={ui.inlineSelect} value={formData.originLocationId} onChange={(e) => setFormData({ ...formData, originLocationId: e.target.value })}>
                                            {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                        </select>
                                    </td>
                                    <td className={table.cell}>
                                        <select className={ui.inlineSelect} value={formData.destinationLocationId} onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}>
                                            {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.locationCode})</option>)}
                                        </select>
                                    </td>
                                    <td className={table.cell}>
                                        <select className={cn(ui.inlineSelect, table.selectStrong)} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Transportation['type'] })}>
                                            <option value="FLIGHT">FLIGHT</option>
                                            <option value="BUS">BUS</option>
                                            <option value="SUBWAY">SUBWAY</option>
                                            <option value="UBER">UBER</option>
                                        </select>
                                    </td>
                                    <td className={table.cell}>
                                        <div className={table.dayList}>
                                            {DAYS.map((d, i) => (
                                                <button key={i} type="button" onClick={() => handleDayToggle(i + 1)} className={cn(ui.dayToggle, formData.operatingDays.includes(i + 1) && ui.dayToggleActive)}>{d}</button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className={table.cellRight}>
                                        <div className={table.rowActions}>
                                            <button onClick={handleSave} className={cn(ui.iconButton, ui.iconButtonSuccess)}><Save size={18} /></button>
                                            <button onClick={resetEditor} className={cn(ui.iconButton, ui.iconButtonNeutral)}><X size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={t.id} className={ui.dataRow}>
                                    <td className={cn(table.cell, table.valueStrong)}>{t.originLocation.name} <span className={table.subtleCode}>({t.originLocation.locationCode})</span></td>
                                    <td className={cn(table.cell, table.valueStrong)}>{t.destinationLocation.name} <span className={table.subtleCode}>({t.destinationLocation.locationCode})</span></td>
                                    <td className={table.cell}>
                                        <span className={t.type === 'FLIGHT' ? table.typeFlight : table.typeTransfer}>{t.type}</span>
                                    </td>
                                    <td className={table.cell}>
                                        <div className={table.dayList}>
                                            {DAYS.map((d, i) => (
                                                <span key={i} className={cn(table.dayDot, t.operatingDays?.includes(i + 1) ? table.dayDotActive : table.dayDotInactive)}>{d.charAt(0)}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className={table.cellRight}>
                                        <div className={table.rowActions}>
                                            <button onClick={() => { setIsEditing(t.id); setIsAdding(false); setFormData(mapTransportationToForm(t)); }} className={cn(ui.iconButton, ui.iconButtonEdit)}><Edit2 size={16} /></button>
                                            <button onClick={() => setPendingDelete(t)} className={cn(ui.iconButton, ui.iconButtonDelete)}><Trash2 size={16} /></button>
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
                    title="Delete transportation"
                    message={`Delete the ${pendingDelete.type} leg from ${pendingDelete.originLocation.locationCode} to ${pendingDelete.destinationLocation.locationCode}?`}
                    onConfirm={handleDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </>
    );
};
