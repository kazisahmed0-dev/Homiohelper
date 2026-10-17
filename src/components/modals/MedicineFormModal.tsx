import React, { useState, useEffect } from 'react';
import { X, Pill, AlertCircle, Plus } from 'lucide-react';
import { Medicine, MedicineCategory } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    success: boolean;
    error?: string;
  };
  initialMedicine?: Medicine | null;
}

const COMMON_POTENCY_PRESETS = [
  'Q',
  '6C',
  '30C',
  '200C',
  '1M',
  '10M',
  '50M',
  'CM',
  '0/1 LM',
  '0/2 LM',
  '0/3 LM',
  '3X',
  '6X',
  '12X',
];

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialMedicine,
}) => {
  const { t, language } = useLanguage();
  const isEditing = Boolean(initialMedicine);

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [commonName, setCommonName] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('dilution');
  const [customCategory, setCustomCategory] = useState('');
  const [potencies, setPotencies] = useState<string[]>(['30C', '200C']);
  const [newPotencyInput, setNewPotencyInput] = useState('');
  const [form, setForm] = useState('liquid');
  const [packSize, setPackSize] = useState('30ml');
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [unit, setUnit] = useState('phial');
  const [reorderLevel, setReorderLevel] = useState<number | string>(10);
  const [rackLocation, setRackLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form when opened or when initialMedicine changes
  useEffect(() => {
    if (initialMedicine) {
      setName(initialMedicine.name || '');
      setNameBn(initialMedicine.nameBn || '');
      setCommonName(initialMedicine.commonName || '');
      
      const standardCats = ['dilution', 'mother_tincture', 'biochemic', 'trituration', 'patent'];
      if (standardCats.includes(initialMedicine.category)) {
        setCategory(initialMedicine.category);
        setCustomCategory('');
      } else {
        setCategory('other');
        setCustomCategory(initialMedicine.category);
      }

      setPotencies(
        initialMedicine.availablePotencies && initialMedicine.availablePotencies.length > 0
          ? [...initialMedicine.availablePotencies]
          : ['30C']
      );
      setForm(initialMedicine.form || 'liquid');
      setPackSize(initialMedicine.packSize || '30ml');
      setStockQuantity(initialMedicine.stockQuantity ?? 0);
      setUnit(initialMedicine.unit || (language === 'bn' ? 'বোতল' : 'phial'));
      setReorderLevel(initialMedicine.reorderLevel ?? 10);
      setRackLocation(initialMedicine.rackLocation || '');
      setNotes(initialMedicine.notes || '');
      setStatus(initialMedicine.status || 'active');
    } else {
      // Default blank state for adding
      setName('');
      setNameBn('');
      setCommonName('');
      setCategory('dilution');
      setCustomCategory('');
      setPotencies(['30C', '200C']);
      setForm('liquid');
      setPackSize('30ml');
      setStockQuantity(0);
      setUnit(language === 'bn' ? 'বোতল' : 'phial');
      setReorderLevel(10);
      setRackLocation('');
      setNotes('');
      setStatus('active');
    }
    setNewPotencyInput('');
    setErrorMessage(null);
  }, [initialMedicine, isOpen, language]);

  if (!isOpen) return null;

  const handleAddPotency = (potencyToAdd: string) => {
    const trimmed = potencyToAdd.trim();
    if (!trimmed) return;
    if (!potencies.includes(trimmed)) {
      setPotencies([...potencies, trimmed]);
    }
    setNewPotencyInput('');
  };

  const handleRemovePotency = (potencyToRemove: string) => {
    setPotencies(potencies.filter((p) => p !== potencyToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage(t('medsValidationNameRequired'));
      return;
    }

    if (potencies.length === 0) {
      setErrorMessage(t('medsValidationPotencyRequired'));
      return;
    }

    const finalCategory =
      category === 'other'
        ? customCategory.trim() || 'custom'
        : category;

    const result = onSubmit({
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      commonName: commonName.trim() || undefined,
      category: finalCategory,
      availablePotencies: potencies,
      form,
      packSize: packSize.trim() || undefined,
      stockQuantity: Number(stockQuantity) || 0,
      unit: unit.trim() || (language === 'bn' ? 'বোতল' : 'phial'),
      reorderLevel: Number(reorderLevel) || 10,
      rackLocation: rackLocation.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });

    if (!result.success) {
      setErrorMessage(result.error || t('medsValidationDuplicate'));
      return;
    }

    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A1612]/45 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-medicine-title"
        className="relative w-full max-w-2xl bg-white rounded-xl border border-[#CBD6D0] p-5 sm:p-6 shadow-2xl z-10 my-8"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3ECE7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EBF3EF] text-[#164E43] flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-medicine-title" className="text-base sm:text-lg font-bold text-[#142620]">
                {isEditing ? t('medsModalEditTitle') : t('medsModalAddTitle')}
              </h2>
              <p className="text-xs text-[#5D7068] mt-0.5">
                {language === 'bn'
                  ? 'ঔষধের নাম, ধরন, পোটেন্সি তালিকা এবং স্টোরেজ বিবরণ পূরণ করুন'
                  : 'Enter remedy names, category, potencies, and pharmacy storage info'}
              </p>
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

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Row 1: English Name (Required) & Bengali Name (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label={t('medsFieldNameEn')}
              placeholder={t('medsFieldNameEnPlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage(null);
              }}
              required
            />
            <Input
              label={t('medsFieldNameBn')}
              placeholder={t('medsFieldNameBnPlaceholder')}
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
            />
          </div>

          {/* Row 2: Common Name / Source & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label={t('medsFieldCommonName')}
              placeholder={t('medsFieldCommonNamePlaceholder')}
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
            />

            <div>
              <Select
                label={t('medsFieldCategory')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="dilution">{t('medsFilterDilution')} (Dilution)</option>
                <option value="mother_tincture">{t('medsFilterMotherTincture')} (Mother Tincture Q)</option>
                <option value="biochemic">{t('medsFilterBiochemic')} (Biochemic Salt)</option>
                <option value="trituration">{t('medsFilterTrituration')} (Trituration)</option>
                <option value="patent">{language === 'bn' ? 'পেটেন্ট ও কম্বিনেশন' : 'Patent / Combination'}</option>
                <option value="other">{language === 'bn' ? 'অন্যান্য / কাস্টম' : 'Other / Custom'}</option>
              </Select>
              {category === 'other' && (
                <div className="mt-2">
                  <Input
                    placeholder={t('medsFieldCustomCategory')}
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Potencies & Variants Management */}
          <div className="p-3.5 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#182C25] block">
                {t('medsFieldPotencies')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <span className="text-[11px] text-[#60746D]">
                {potencies.length} {language === 'bn' ? 'টি পোটেন্সি নির্বাচিত' : 'potencies selected'}
              </span>
            </div>

            {/* Currently Selected Potencies Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white border border-[#CFDAD4] rounded-lg">
              {potencies.length === 0 ? (
                <span className="text-xs text-[#8FA19B] italic">
                  {language === 'bn'
                    ? 'কোনো পোটেন্সি যোগ করা হয়নি। নিচে থেকে ক্লিক করুন বা লিখুন।'
                    : 'No potencies added yet. Click presets below or type custom.'}
                </span>
              ) : (
                potencies.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 font-mono text-xs font-medium bg-[#E8F2ED] text-[#164E43] px-2 py-0.5 rounded border border-[#C5DDD2]"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePotency(p)}
                      className="hover:text-red-600 rounded p-0.5"
                      title={language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Input to type custom potency */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('medsFieldAddPotency')}
                value={newPotencyInput}
                onChange={(e) => setNewPotencyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPotency(newPotencyInput);
                  }
                }}
                className="flex-1 text-xs bg-white border border-[#CFDAD4] rounded-lg px-3 py-1.5 min-h-[34px] text-[#192622] placeholder:text-[#8FA19B] focus:outline-none focus:ring-1 focus:ring-[#164E43]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddPotency(newPotencyInput)}
                className="text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t('actionAdd')}
              </Button>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8079] tracking-wider mb-1.5">
                {language === 'bn' ? 'সাধারণ পোটেন্সি সমূহ (ক্লিক করে যোগ করুন):' : 'Common Presets (Click to add):'}
              </p>
              <div className="flex flex-wrap gap-1">
                {COMMON_POTENCY_PRESETS.map((preset) => {
                  const isSelected = potencies.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleRemovePotency(preset);
                        } else {
                          handleAddPotency(preset);
                        }
                      }}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded transition-all border ${
                        isSelected
                          ? 'bg-[#164E43] text-white border-[#164E43]'
                          : 'bg-white text-[#4A5D56] border-[#D4DFDA] hover:border-[#164E43]'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Medicine Form & Pack Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label={t('medsFieldForm')}
              value={form}
              onChange={(e) => setForm(e.target.value)}
            >
              <option value="liquid">{language === 'bn' ? 'তরল ড্রপস / লিকুইড (Liquid)' : 'Liquid Drops'}</option>
              <option value="globules">{language === 'bn' ? 'গ্লোবিউলস / বড়ি (Globules / Pellets)' : 'Globules / Pellets'}</option>
              <option value="tablets">{language === 'bn' ? 'ট্যাবলেট (Tablets / Biochemic)' : 'Tablets / Trituration'}</option>
              <option value="powder">{language === 'bn' ? 'পাউডার / চূর্ণ (Powder)' : 'Powder'}</option>
              <option value="ointment">{language === 'bn' ? 'মলম / লোশন (Ointment / Lotion)' : 'Ointment / Lotion'}</option>
            </Select>

            <Input
              label={t('medsFieldPackSize')}
              placeholder={t('medsFieldPackSizePlaceholder')}
              value={packSize}
              onChange={(e) => setPackSize(e.target.value)}
            />
          </div>

          {/* Row 4: Stock Quantity, Unit, Reorder Level, Rack Location */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              type="number"
              min="0"
              label={t('medsFieldStockQty')}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
            <Input
              label={t('medsFieldUnit')}
              placeholder="phial, bottle"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              label={t('medsFieldReorderLevel')}
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
            />
            <Input
              label={t('medsFieldRackLocation')}
              placeholder={t('medsFieldRackLocationPlaceholder')}
              value={rackLocation}
              onChange={(e) => setRackLocation(e.target.value)}
            />
          </div>

          {/* Row 5: Notes & Clinical Remarks */}
          <Textarea
            label={t('medsFieldNotes')}
            placeholder={t('medsFieldNotesPlaceholder')}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Row 6: Status Toggle if editing */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-semibold text-[#182C25]">
                {language === 'bn' ? 'রেকর্ড অবস্থা:' : 'Record Status:'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border ${
                    status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t('medsStatusActive')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('archived')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border ${
                    status === 'archived'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t('medsStatusArchived')}
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3ECE7]">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              {t('actionCancel')}
            </Button>
            <Button type="submit" variant="primary" size="md">
              {isEditing ? t('actionSave') : t('medsAddNew')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
