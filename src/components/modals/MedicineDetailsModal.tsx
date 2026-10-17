import React from 'react';
import { X, Pill, Edit, Archive, CheckCircle2, AlertTriangle, Layers, MapPin, Package } from 'lucide-react';
import { Medicine } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../ui/Button';

export interface MedicineDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onEdit: (medicine: Medicine) => void;
  onArchiveToggle: (medicine: Medicine) => void;
  onDeleteRequest: (medicine: Medicine) => void;
}

export const MedicineDetailsModal: React.FC<MedicineDetailsModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onEdit,
  onArchiveToggle,
  onDeleteRequest,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen || !medicine) return null;

  const isArchived = medicine.status === 'archived';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A1612]/45 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-details-title"
        className="relative w-full max-w-xl bg-white rounded-xl border border-[#CBD6D0] p-5 sm:p-6 shadow-2xl z-10 my-8 space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3ECE7]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#EBF3EF] text-[#164E43] flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="modal-details-title" className="text-lg font-bold text-[#142620]">
                  {medicine.name}
                </h2>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isArchived
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isArchived ? t('medsStatusArchived') : t('medsStatusActive')}
                </span>
              </div>
              {medicine.nameBn && (
                <p className="text-xs text-[#164E43] font-medium mt-0.5">
                  {medicine.nameBn}
                </p>
              )}
              {medicine.commonName && (
                <p className="text-xs text-[#637770]">
                  {medicine.commonName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6D8078] hover:text-[#182622] p-1.5 rounded-lg hover:bg-[#F0F5F2] transition-colors"
            aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="space-y-4 text-xs">
          {/* Category & Form */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg">
            <div>
              <span className="text-[#60746D] block font-medium mb-0.5">
                {t('medsColCategory')}
              </span>
              <p className="font-semibold text-sm text-[#182B25] capitalize">
                {medicine.category.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-[#60746D] block font-medium mb-0.5">
                {t('medsColFormPack')}
              </span>
              <p className="font-semibold text-sm text-[#182B25] capitalize">
                {medicine.form || 'Liquid'} · {medicine.packSize || '30ml'}
              </p>
            </div>
          </div>

          {/* Potencies */}
          <div className="p-3.5 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg space-y-1.5">
            <span className="text-[#60746D] block font-medium">
              {t('medsFieldPotencies')} ({medicine.availablePotencies.length})
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {medicine.availablePotencies.map((p) => (
                <span
                  key={p}
                  className="font-mono text-xs font-semibold bg-white border border-[#CBD8D2] text-[#164E43] px-2.5 py-1 rounded-md shadow-2xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Stock & Storage */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg">
            <div>
              <span className="text-[#60746D] block font-medium mb-0.5">
                {t('medsColInStock')}
              </span>
              <p className="font-semibold text-sm text-[#182B25]">
                {medicine.stockQuantity} {medicine.unit}
              </p>
              <p className="text-[11px] text-[#637770] mt-0.5">
                {t('medsFieldReorderLevel')}: {medicine.reorderLevel}
              </p>
            </div>
            <div>
              <span className="text-[#60746D] block font-medium mb-0.5">
                {t('medsColLocation')}
              </span>
              <p className="font-semibold text-sm text-[#182B25]">
                {medicine.rackLocation || '—'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {medicine.notes && (
            <div className="p-3.5 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg space-y-1">
              <span className="text-[#60746D] block font-medium">
                {t('medsFieldNotes')}
              </span>
              <p className="text-sm text-[#273B34] leading-relaxed">
                {medicine.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E3ECE7]">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onArchiveToggle(medicine)}
              className="text-xs"
            >
              <Archive className="w-3.5 h-3.5 mr-1" />
              {isArchived ? t('medsUnarchive') : t('medsArchive')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteRequest(medicine)}
              className="text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              {t('actionDelete')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t('actionClose')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(medicine);
              }}
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              {t('actionEdit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
