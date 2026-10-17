import { Medicine } from '../types';

const STORAGE_KEY = 'homiohelper_medicines_data';

/**
 * Standard baseline Homoeopathic Remedies catalog.
 * Realistic clinical records representative of homoeopathic practice in Bangladesh.
 */
const DEFAULT_HOMOEO_MEDICINES: Medicine[] = [
  {
    id: 'med-aconitum',
    name: 'Aconitum Napellus',
    nameBn: 'একোনাইট নেপেলাস',
    commonName: 'Monkshood',
    category: 'dilution',
    availablePotencies: ['30C', '200C', '1M'],
    form: 'liquid',
    packSize: '30ml',
    stockQuantity: 45,
    unit: '30ml phial',
    reorderLevel: 10,
    rackLocation: 'A-12',
    notes: 'Sudden intense fever, acute inflammatory onset, restlessness & anxiety.',
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'med-arnica',
    name: 'Arnica Montana',
    nameBn: 'আর্নিকা মন্টানা',
    commonName: "Leopard's Bane",
    category: 'dilution',
    availablePotencies: ['Q', '30C', '200C', '1M'],
    form: 'liquid',
    packSize: '30ml',
    stockQuantity: 120,
    unit: '30ml phial',
    reorderLevel: 20,
    rackLocation: 'A-14',
    notes: 'Mechanical injuries, bruised soreness, blunt trauma, post-extraction.',
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'med-belladonna',
    name: 'Belladonna',
    nameBn: 'বেলেডোনা',
    commonName: 'Deadly Nightshade',
    category: 'dilution',
    availablePotencies: ['30C', '200C'],
    form: 'liquid',
    packSize: '30ml',
    stockQuantity: 60,
    unit: '30ml phial',
    reorderLevel: 15,
    rackLocation: 'B-04',
    notes: 'Violent throbbing headache, high flushed fever, heat, redness.',
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'med-crataegus',
    name: 'Crataegus Oxyacantha',
    nameBn: 'ক্র্যাটিগাস অক্সিয়াকান্থা',
    commonName: 'Hawthorn Berry',
    category: 'mother_tincture',
    availablePotencies: ['Q'],
    form: 'liquid',
    packSize: '100ml',
    stockQuantity: 35,
    unit: '100ml phial',
    reorderLevel: 10,
    rackLocation: 'MT-01',
    notes: 'Cardiotonic, extreme dyspnoea on least exertion, cardiac dropsy.',
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'med-calc-phos',
    name: 'Calcarea Phosphorica',
    nameBn: 'ক্যালকেরিয়া ফসফোরিকা',
    commonName: 'Phosphate of Lime',
    category: 'biochemic',
    availablePotencies: ['6X', '12X'],
    form: 'tablets',
    packSize: '100g',
    stockQuantity: 28,
    unit: '100g pack',
    reorderLevel: 8,
    rackLocation: 'BC-08',
    notes: 'Biochemic tissue salt for delayed dentition, bone fractures, and rickets.',
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'med-nux-vomica',
    name: 'Nux Vomica',
    nameBn: 'নাক্স ভূমিকা',
    commonName: 'Poison Nut',
    category: 'dilution',
    availablePotencies: ['30C', '200C', '1M'],
    form: 'liquid',
    packSize: '30ml',
    stockQuantity: 85,
    unit: '30ml phial',
    reorderLevel: 15,
    rackLocation: 'N-02',
    notes: 'Sedentary habits, dyspepsia, over-indulgence, irritable gastric troubles.',
    status: 'active',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'med-pulsatilla',
    name: 'Pulsatilla Nigricans',
    nameBn: 'পালসেটিলা নাইগ্রিক্যানস',
    commonName: 'Wind Flower',
    category: 'dilution',
    availablePotencies: ['30C', '200C'],
    form: 'liquid',
    packSize: '30ml',
    stockQuantity: 52,
    unit: '30ml phial',
    reorderLevel: 12,
    rackLocation: 'P-05',
    notes: 'Mild weeping disposition, changeability of symptoms, thirstlessness.',
    status: 'active',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'med-syzygium',
    name: 'Syzygium Jambolanum',
    nameBn: 'সাইজিজিয়াম জাম্বোলানাম',
    commonName: 'Black Plum / Jam',
    category: 'mother_tincture',
    availablePotencies: ['Q'],
    form: 'liquid',
    packSize: '100ml',
    stockQuantity: 40,
    unit: '100ml phial',
    reorderLevel: 10,
    rackLocation: 'MT-08',
    notes: 'Glycosuria, diabetes mellitus management, excessive thirst and emaciation.',
    status: 'active',
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T10:00:00.000Z',
  },
];

/**
 * Medicine Storage Service
 * Abstracted persistence layer designed for client-side state with localStorage caching,
 * structured for straightforward migration to Firestore/Cloud DB in upcoming phases.
 */
class MedicineStorageService {
  private cache: Medicine[] | null = null;

  public getMedicines(): Medicine[] {
    if (this.cache) {
      return [...this.cache];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cache = parsed;
          return [...this.cache];
        }
      }
    } catch (e) {
      console.warn('Could not read medicines from storage, using defaults:', e);
    }

    // Default seed initialization
    this.cache = [...DEFAULT_HOMOEO_MEDICINES];
    this.saveToStorage(this.cache);
    return [...this.cache];
  }

  public getMedicineById(id: string): Medicine | undefined {
    return this.getMedicines().find((m) => m.id === id);
  }

  public addMedicine(
    data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; medicine?: Medicine; error?: string } {
    const list = this.getMedicines();

    // Check duplicate English name
    const normalizedName = data.name.trim().toLowerCase();
    const isDuplicate = list.some(
      (m) => m.name.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      return {
        success: false,
        error: `A medicine with the name "${data.name.trim()}" already exists.`,
      };
    }

    const newMedicine: Medicine = {
      ...data,
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      nameBn: data.nameBn?.trim() || undefined,
      commonName: data.commonName?.trim() || undefined,
      category: data.category || 'dilution',
      availablePotencies:
        data.availablePotencies && data.availablePotencies.length > 0
          ? data.availablePotencies
          : ['Q'],
      form: data.form || 'liquid',
      packSize: data.packSize?.trim() || '30ml',
      stockQuantity: Number(data.stockQuantity) || 0,
      unit: data.unit?.trim() || 'phial',
      reorderLevel: Number(data.reorderLevel) || 10,
      rackLocation: data.rackLocation?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newMedicine, ...list];
    this.cache = updatedList;
    this.saveToStorage(updatedList);

    return {
      success: true,
      medicine: newMedicine,
    };
  }

  public updateMedicine(
    id: string,
    updates: Partial<Omit<Medicine, 'id' | 'createdAt'>>
  ): { success: boolean; medicine?: Medicine; error?: string } {
    const list = this.getMedicines();
    const index = list.findIndex((m) => m.id === id);

    if (index === -1) {
      return { success: false, error: 'Medicine not found.' };
    }

    // Check name uniqueness if name was modified
    if (updates.name) {
      const normalizedNewName = updates.name.trim().toLowerCase();
      const duplicate = list.find(
        (m) => m.id !== id && m.name.trim().toLowerCase() === normalizedNewName
      );
      if (duplicate) {
        return {
          success: false,
          error: `Another medicine named "${updates.name.trim()}" already exists.`,
        };
      }
    }

    const current = list[index];
    const updatedMedicine: Medicine = {
      ...current,
      ...updates,
      name: updates.name ? updates.name.trim() : current.name,
      nameBn: updates.nameBn !== undefined ? updates.nameBn.trim() : current.nameBn,
      commonName:
        updates.commonName !== undefined
          ? updates.commonName.trim()
          : current.commonName,
      availablePotencies:
        updates.availablePotencies && updates.availablePotencies.length > 0
          ? updates.availablePotencies
          : current.availablePotencies,
      stockQuantity:
        updates.stockQuantity !== undefined
          ? Number(updates.stockQuantity)
          : current.stockQuantity,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedMedicine;
    this.cache = list;
    this.saveToStorage(list);

    return {
      success: true,
      medicine: updatedMedicine,
    };
  }

  public archiveMedicine(id: string): { success: boolean; medicine?: Medicine; error?: string } {
    return this.updateMedicine(id, { status: 'archived' });
  }

  public unarchiveMedicine(id: string): { success: boolean; medicine?: Medicine; error?: string } {
    return this.updateMedicine(id, { status: 'active' });
  }

  public deleteMedicine(id: string): { success: boolean; error?: string } {
    const list = this.getMedicines();
    const target = list.find((m) => m.id === id);

    if (!target) {
      return { success: false, error: 'Medicine not found.' };
    }

    const filtered = list.filter((m) => m.id !== id);
    this.cache = filtered;
    this.saveToStorage(filtered);

    return { success: true };
  }

  public resetToDefaultCatalog(): Medicine[] {
    this.cache = [...DEFAULT_HOMOEO_MEDICINES];
    this.saveToStorage(this.cache);
    return [...this.cache];
  }

  private saveToStorage(list: Medicine[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Unable to persist medicines to localStorage:', e);
    }
  }
}

export const medicineStorage = new MedicineStorageService();
