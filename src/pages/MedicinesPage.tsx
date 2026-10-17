import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, Archive, RotateCcw, AlertTriangle } from 'lucide-react';
import { Medicine, NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { medicineStorage } from '../services/medicineStorage';
import { PageHeading } from '../components/ui/PageHeading';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Table, Column } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { NotificationBanner } from '../components/ui/NotificationBanner';
import { MedicineFormModal } from '../components/modals/MedicineFormModal';
import { MedicineDetailsModal } from '../components/modals/MedicineDetailsModal';

export interface MedicinesPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const MedicinesPage: React.FC<MedicinesPageProps> = () => {
  const { t, language } = useLanguage();

  // Primary medicines data state loaded from storage service
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);

  // Delete / Archive confirmation modal state
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Flash notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Load medicines on mount
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    const list = medicineStorage.getMedicines();
    setMedicines(list);
  };

  const showNotification = (
    type: 'success' | 'info' | 'warning' | 'error',
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Handle open add modal
  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsFormModalOpen(true);
  };

  // Handle open view modal
  const handleOpenViewModal = (medicine: Medicine) => {
    setViewingMedicine(medicine);
  };

  // Handle create or update submit
  const handleFormSubmit = (
    data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; error?: string } => {
    if (editingMedicine) {
      const res = medicineStorage.updateMedicine(editingMedicine.id, data);
      if (res.success && res.medicine) {
        loadMedicines();
        // If currently viewing, update the viewing object
        if (viewingMedicine?.id === editingMedicine.id) {
          setViewingMedicine(res.medicine);
        }
        showNotification('success', t('medsSuccessUpdate'));
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = medicineStorage.addMedicine(data);
      if (res.success) {
        loadMedicines();
        showNotification('success', t('medsSuccessAdd'));
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  // Handle toggle archive
  const handleArchiveToggle = (medicine: Medicine) => {
    if (medicine.status === 'archived') {
      medicineStorage.unarchiveMedicine(medicine.id);
      showNotification('success', language === 'bn' ? 'ওষুধটি সক্রিয় তালিকায় ফিরিয়ে আনা হয়েছে।' : 'Medicine restored to active catalog.');
    } else {
      medicineStorage.archiveMedicine(medicine.id);
      showNotification('info', t('medsSuccessArchive'));
    }
    loadMedicines();
    if (viewingMedicine?.id === medicine.id) {
      const updated = medicineStorage.getMedicineById(medicine.id);
      setViewingMedicine(updated || null);
    }
  };

  // Handle initiate delete request
  const handleDeleteRequest = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm permanent delete
  const handleConfirmDelete = () => {
    if (!medicineToDelete) return;

    const res = medicineStorage.deleteMedicine(medicineToDelete.id);
    if (res.success) {
      loadMedicines();
      if (viewingMedicine?.id === medicineToDelete.id) {
        setViewingMedicine(null);
      }
      showNotification('success', t('medsSuccessDelete'));
    } else {
      showNotification('error', res.error || 'Failed to delete medicine.');
    }

    setIsDeleteDialogOpen(false);
    setMedicineToDelete(null);
  };

  // Filter and search logic
  const filteredMedicines = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return medicines.filter((m) => {
      // Category / Status Filter
      if (categoryFilter === 'archived') {
        if (m.status !== 'archived') return false;
      } else {
        // By default show only active unless specifically viewing archived
        if (categoryFilter === 'all') {
          if (m.status === 'archived') return false;
        } else {
          if (m.status === 'archived') return false;
          if (m.category !== categoryFilter) return false;
        }
      }

      // Search Query Filter
      if (!q) return true;

      const matchEnName = m.name.toLowerCase().includes(q);
      const matchBnName = m.nameBn ? m.nameBn.toLowerCase().includes(q) : false;
      const matchCommon = m.commonName ? m.commonName.toLowerCase().includes(q) : false;
      const matchLocation = m.rackLocation ? m.rackLocation.toLowerCase().includes(q) : false;
      const matchPotency = m.availablePotencies.some((p) => p.toLowerCase().includes(q));

      return matchEnName || matchBnName || matchCommon || matchLocation || matchPotency;
    });
  }, [medicines, searchTerm, categoryFilter]);

  // Dynamic metrics calculation
  const activeMedicinesCount = useMemo(() => {
    return medicines.filter((m) => m.status !== 'archived').length;
  }, [medicines]);

  const totalPotenciesCount = useMemo(() => {
    return medicines
      .filter((m) => m.status !== 'archived')
      .reduce((acc, m) => acc + (m.availablePotencies?.length || 0), 0);
  }, [medicines]);

  // Table Columns
  const columns: Column<Medicine>[] = [
    {
      key: 'name',
      header: t('medsColName'),
      render: (m) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#142620]">{m.name}</span>
            {m.status === 'archived' && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                {t('medsStatusArchived')}
              </span>
            )}
          </div>
          {m.nameBn && (
            <p className="text-xs text-[#164E43] font-medium leading-tight">
              {m.nameBn}
            </p>
          )}
          {m.commonName && (
            <p className="text-[11px] text-[#637770] leading-tight">
              {m.commonName}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: t('medsColCategory'),
      render: (m) => (
        <span className="text-xs font-medium text-[#293E37]">
          {m.category === 'dilution'
            ? t('medsFilterDilution')
            : m.category === 'mother_tincture'
            ? t('medsFilterMotherTincture')
            : m.category === 'biochemic'
            ? t('medsFilterBiochemic')
            : m.category === 'trituration'
            ? t('medsFilterTrituration')
            : m.category}
        </span>
      ),
    },
    {
      key: 'potencies',
      header: t('medsColPotencies'),
      render: (m) => (
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
          {m.availablePotencies.map((p) => (
            <span
              key={p}
              className="text-xs font-mono bg-[#EBF2EE] text-[#164E43] px-1.5 py-0.5 rounded border border-[#CFDED7]"
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'formPack',
      header: t('medsColFormPack'),
      render: (m) => (
        <span className="text-xs text-[#3E524B]">
          <span className="capitalize">{m.form || 'Liquid'}</span>
          {m.packSize ? ` · ${m.packSize}` : ''}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: t('medsColInStock'),
      render: (m) => {
        const isLow = m.stockQuantity <= (m.reorderLevel || 10);
        return (
          <div className="text-xs">
            <span
              className={`font-semibold ${
                isLow ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-[#182B25]'
              }`}
            >
              {m.stockQuantity} {m.unit}
            </span>
            {isLow && (
              <span className="block text-[10px] text-amber-600 mt-0.5">
                {language === 'bn' ? 'রিঅর্ডার সতর্কতা' : 'Reorder Alert'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'rackLocation',
      header: t('medsColLocation'),
      render: (m) => (
        <span className="text-xs font-mono text-[#586A63] bg-[#F2F6F4] px-1.5 py-0.5 rounded">
          {m.rackLocation || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('medsColActions'),
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenViewModal(m)}
            className="text-xs h-7 px-2"
            title={t('medsViewDetails')}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            {t('actionView')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditModal(m)}
            className="text-xs h-7 px-2"
            title={t('medsEdit')}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            {t('actionEdit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteRequest(m)}
            className="text-xs h-7 px-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
            title={t('actionDelete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Heading with Prominent "+ নতুন ওষুধ যোগ করুন" Action */}
      <PageHeading
        title={t('medsTitle')}
        subtitle={t('medsSubtitle')}
        badgeText={`${activeMedicinesCount} ${t('medsCounterBadge')} · ${totalPotenciesCount} ${t('medsPotencyCounter')}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddModal}
            >
              {t('medsAddNew')}
            </Button>
          </div>
        }
      />

      {/* Flash notification banner if operation completed */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Search Input & Category Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white p-4 border border-[#D5E1DB] rounded-xl shadow-2xs">
        <div className="w-full lg:max-w-md">
          <SearchInput
            placeholder={t('medsSearchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 p-1 bg-[#EEF3F0] rounded-lg border border-[#D7E2DC]">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5A6D66] hover:text-[#164E43]'
            }`}
          >
            {t('medsFilterAll')}
          </button>
          <button
            onClick={() => setCategoryFilter('dilution')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              categoryFilter === 'dilution'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5A6D66] hover:text-[#164E43]'
            }`}
          >
            {t('medsFilterDilution')}
          </button>
          <button
            onClick={() => setCategoryFilter('mother_tincture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              categoryFilter === 'mother_tincture'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5A6D66] hover:text-[#164E43]'
            }`}
          >
            {t('medsFilterMotherTincture')}
          </button>
          <button
            onClick={() => setCategoryFilter('biochemic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              categoryFilter === 'biochemic'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5A6D66] hover:text-[#164E43]'
            }`}
          >
            {t('medsFilterBiochemic')}
          </button>
          <button
            onClick={() => setCategoryFilter('trituration')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              categoryFilter === 'trituration'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5A6D66] hover:text-[#164E43]'
            }`}
          >
            {t('medsFilterTrituration')}
          </button>
          <button
            onClick={() => setCategoryFilter('archived')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              categoryFilter === 'archived'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5A6D66] hover:text-[#164E43]'
            }`}
          >
            {t('medsFilterArchived')}
          </button>
        </div>
      </div>

      {/* Active Table or Filtered Empty State */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          title={t('medsEmptyTitle')}
          description={
            searchTerm
              ? `${t('noResultsFound')} "${searchTerm}".`
              : t('medsEmptyMsg')
          }
          actionLabel={t('medsAddNew')}
          onAction={handleOpenAddModal}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => handleOpenViewModal(item)}
        />
      )}

      {/* Add / Edit Medicine Modal */}
      <MedicineFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialMedicine={editingMedicine}
      />

      {/* View Medicine Details Modal */}
      <MedicineDetailsModal
        isOpen={Boolean(viewingMedicine)}
        onClose={() => setViewingMedicine(null)}
        medicine={viewingMedicine}
        onEdit={(med) => handleOpenEditModal(med)}
        onArchiveToggle={(med) => handleArchiveToggle(med)}
        onDeleteRequest={(med) => handleDeleteRequest(med)}
      />

      {/* Delete / Archive Confirmation Dialog with Stock Safety Warning */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={t('medsDeleteDialogTitle')}
        message={
          medicineToDelete && medicineToDelete.stockQuantity > 0
            ? `${t('medsDeleteStockWarning')} (${medicineToDelete.name}: ${medicineToDelete.stockQuantity} ${medicineToDelete.unit})`
            : t('medsDeleteDialogMsg')
        }
        confirmLabel={t('actionDelete')}
        cancelLabel={t('actionCancel')}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMedicineToDelete(null);
        }}
      />
    </div>
  );
};
