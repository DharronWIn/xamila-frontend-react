import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles } from "lucide-react";

interface PartnerAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  partnerName: string;
  linkUrl: string;
  badge?: string;
  type?: "banner" | "product" | "service";
}

interface PartnerAdvertisementProps {
  ad: PartnerAd;
}

export function PartnerAdvertisement({ ad }: PartnerAdvertisementProps) {
  const handleClick = () => {
    window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 transition-all cursor-pointer overflow-hidden group">
      <div onClick={handleClick} className="relative">
        {/* Badge "Publicité" */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Publicité
          </Badge>
        </div>

        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/400x300?text=Partenaire";
            }}
          />
          {ad.badge && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                {ad.badge}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-2">
          <div>
            <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wide">
              {ad.partnerName}
            </p>
            <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {ad.title}
            </h3>
          </div>
          
          {ad.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {ad.description}
            </p>
          )}

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs group-hover:bg-primary group-hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Découvrir
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

