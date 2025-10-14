
import {
  Bed,
  DoorOpen,
  RectangleHorizontal
} from "lucide-react";

export interface ElementType {
  type: string;
  icon: any;
  emoji: string;
  label: string;
  color: string;
  defaultSize: { width: number; height: number };
  description: string;
  category: 'beds' | 'openings';
  tags: string[];
  popular?: boolean;
  customizable?: {
    bedType?: boolean;
    orientation?: boolean;
    size?: boolean;
    bedId?: boolean;
    position?: boolean;
    drawers?: boolean;
    brightness?: boolean;
    type?: boolean;
    hinge?: boolean;
    openClose?: boolean;
    bunkLevels?: boolean;
    levelAssignment?: boolean;
  };
}

export const elementTypes: ElementType[] = [
  // BEDS CATEGORY
  {
    type: 'single-bed',
    icon: Bed,
    emoji: '🛏️',
    label: 'Single Bed',
    color: '#3B82F6',
    defaultSize: { width: 1.3, height: 3.1 },
    description: 'Standard single bed',
    category: 'beds',
    tags: ['sleep', 'bedroom', 'single'],
    popular: true,
    customizable: { bedType: true, orientation: true, size: true, bedId: true }
  },
  {
    type: 'bunk-bed',
    icon: Bed,
    emoji: '🛏️',
    label: 'Bunk Bed',
    color: '#1E40AF',
    defaultSize: { width: 2.6, height: 2.2 },
    description: 'Multi-level bunk bed with 2 or 3 levels - assign students to each level',
    category: 'beds',
    tags: ['sleep', 'bedroom', 'bunk', 'space-saving', 'multi-level'],
    popular: true,
    customizable: {
      bedType: true,
      orientation: true,
      position: true,
      bedId: true,
      bunkLevels: true,
      levelAssignment: true
    }
  },

  // OPENINGS & STRUCTURE
  {
    type: 'door',
    icon: DoorOpen,
    emoji: '🚪',
    label: 'Door',
    color: '#8B5CF6',
    defaultSize: { width: 0.9, height: 2.1 }, // 🔧 FIXED: Realistic door size - 3ft wide x 7ft tall
    description: 'Room entrance with left/right hinge options',
    category: 'openings',
    tags: ['entrance', 'access', 'door'],
    popular: true,
    customizable: { hinge: true }
  },
  {
    type: 'window',
    icon: RectangleHorizontal,
    emoji: '🪟',
    label: 'Window',
    color: '#10B981',
    defaultSize: { width: 1.2, height: 1.2 }, // 🔧 FIXED: Realistic window size - 4ft x 4ft square window
    description: 'Natural light source with frame, glass panels, and reflection effects',
    category: 'openings',
    tags: ['light', 'view', 'window', 'ventilation', 'glass', 'frame'],
    popular: true,
    customizable: { size: true, openClose: true }
  }
];

export const categories = [
  { id: 'all', label: 'All Items', count: elementTypes.length, emoji: '📦' },
  { id: 'popular', label: 'Popular', count: elementTypes.filter(e => e.popular).length, emoji: '⭐' },
  { id: 'beds', label: 'Beds', count: elementTypes.filter(e => e.category === 'beds').length, emoji: '🛏️' },
  { id: 'openings', label: 'Openings & Structure', count: elementTypes.filter(e => e.category === 'openings').length, emoji: '🚪' }
];
