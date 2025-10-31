import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Phone } from "lucide-react";
import { useCountries, Country } from "@/lib/apiComponent/hooks/useCountries";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CountryPhoneSelectorProps {
  countryCode?: string;
  phoneNumber?: string;
  onCountryChange: (country: Country) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CountryPhoneSelector({
  countryCode,
  phoneNumber = "",
  onCountryChange,
  onPhoneChange,
  error,
  disabled = false,
  placeholder = "Numéro de téléphone",
  className,
}: CountryPhoneSelectorProps) {
  const { countries, isLoading } = useCountries();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Trouver le pays sélectionné
  const selectedCountry = useMemo(() => {
    if (!countryCode || !countries.length) return null;
    return countries.find(
      (c) => c.alpha2Code === countryCode || c.alpha3Code === countryCode
    );
  }, [countryCode, countries]);

  // Pays par défaut (Côte d'Ivoire)
  const defaultCountry = useMemo(() => {
    return countries.find((c) => c.alpha2Code === "CI") || countries[0] || null;
  }, [countries]);

  // Initialiser avec le pays par défaut si aucun pays n'est sélectionné
  useEffect(() => {
    if (!selectedCountry && defaultCountry && !countryCode) {
      onCountryChange(defaultCountry);
    }
  }, [selectedCountry, defaultCountry, countryCode, onCountryChange]);

  // Filtrer les pays selon la recherche
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.translations.fr?.toLowerCase().includes(query) ||
        country.alpha2Code.toLowerCase().includes(query) ||
        country.alpha3Code.toLowerCase().includes(query) ||
        country.callingCode.includes(query)
    );
  }, [countries, searchQuery]);

  // Gérer le changement de pays
  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Formater le numéro avec le préfixe
  const formatPhoneNumber = (value: string) => {
    // Supprimer tout ce qui n'est pas un chiffre
    const digits = value.replace(/\D/g, "");
    
    // Si le numéro commence par le code d'appel, le retirer
    const callingCode = selectedCountry?.callingCode || defaultCountry?.callingCode || "";
    if (callingCode && digits.startsWith(callingCode)) {
      return digits.slice(callingCode.length);
    }
    
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onPhoneChange(formatted);
  };

  // Gérer la mise au point sur le champ de recherche
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const currentCountry = selectedCountry || defaultCountry;
  const displayCallingCode = currentCountry?.callingCode ? `+${currentCountry.callingCode}` : "";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        {/* Sélecteur de pays */}
        <Select
          value={countryCode || currentCountry?.alpha2Code || ""}
          onValueChange={(value) => {
            const country = countries.find(
              (c) => c.alpha2Code === value || c.alpha3Code === value
            );
            if (country) handleCountrySelect(country);
          }}
          open={isOpen}
          onOpenChange={setIsOpen}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-[180px] h-12">
            <div className="flex items-center gap-2">
              {currentCountry && (
                <img
                  src={currentCountry.flag}
                  alt={currentCountry.name}
                  className="w-6 h-4 object-cover rounded"
                  onError={(e) => {
                    // Fallback si l'image ne charge pas
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <span className="text-sm font-medium">
                {displayCallingCode}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent className="w-[300px]">
            {/* Barre de recherche */}
            <div className="sticky top-0 z-10 bg-background border-b p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher un pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Sélectionner le premier pays filtré
                      const first = filteredCountries[0];
                      if (first) handleCountrySelect(first);
                    }
                  }}
                />
              </div>
            </div>

            {/* Liste des pays */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Aucun pays trouvé
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <SelectItem
                    key={country.alpha2Code}
                    value={country.alpha2Code}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <img
                        src={country.flag}
                        alt={country.name}
                        className="w-6 h-4 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="flex-1 text-sm">
                        {country.translations.fr || country.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        +{country.callingCode}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </div>
          </SelectContent>
        </Select>

        {/* Champ de numéro de téléphone */}
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pl-10 h-12",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
            maxLength={15}
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Aperçu du numéro complet */}
      {phoneNumber && currentCountry && (
        <p className="text-xs text-muted-foreground">
          Numéro complet: +{currentCountry.callingCode} {phoneNumber}
        </p>
      )}
    </div>
  );
}

