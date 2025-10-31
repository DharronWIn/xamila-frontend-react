import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoriesByType, CATEGORY_ICONS, CATEGORY_COLORS } from "@/constants/financialCategories";

interface CategorySelectorProps {
  type: 'INCOME' | 'EXPENSE';
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelector({ 
  type, 
  value, 
  onValueChange, 
  placeholder = "Sélectionner une catégorie",
  disabled = false 
}: CategorySelectorProps) {
  const categories = getCategoriesByType(type);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{CATEGORY_ICONS[category]}</span>
              <span>{category}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface CategoryBadgeProps {
  category: string;
  showIcon?: boolean;
  showColor?: boolean;
  className?: string;
}

export function CategoryBadge({ 
  category, 
  showIcon = true, 
  showColor = true,
  className = ""
}: CategoryBadgeProps) {
  const icon = CATEGORY_ICONS[category] || '📦';
  const color = CATEGORY_COLORS[category] || '#6B7280';

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}
      style={showColor ? { backgroundColor: `${color}20`, color: color } : {}}
    >
      {showIcon && <span>{icon}</span>}
      <span>{category}</span>
    </div>
  );
}

interface CategoryDisplayProps {
  category: string;
  type: 'INCOME' | 'EXPENSE';
  showIcon?: boolean;
  showColor?: boolean;
  className?: string;
}

export function CategoryDisplay({ 
  category, 
  type, 
  showIcon = true, 
  showColor = true,
  className = ""
}: CategoryDisplayProps) {
  const icon = CATEGORY_ICONS[category] || '📦';
  const color = CATEGORY_COLORS[category] || '#6B7280';
  const isIncome = type === 'INCOME';

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${className}`}
      style={showColor ? { 
        backgroundColor: `${color}15`, 
        color: color,
        borderLeft: `3px solid ${color}`
      } : {}}
    >
      {showIcon && <span className="text-lg">{icon}</span>}
      <span>{category}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${
        isIncome 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isIncome ? 'Entrée' : 'Sortie'}
      </span>
    </div>
  );
}
