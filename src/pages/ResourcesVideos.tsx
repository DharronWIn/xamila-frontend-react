import { useEffect, useMemo, useState } from 'react';
import { useResources } from '@/lib/apiComponent/hooks/useResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Film } from 'lucide-react';
import { MediaPlayer } from '@/components/MediaPlayer';
import { educationalContentStore } from '@/store/educationalContentStore';

export default function ResourcesVideos() {
  const { isLoading, error, getResources } = useResources();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [current, setCurrent] = useState<any | null>(null);

  useEffect(() => {
    // Prefer curated store if available; fallback to API hook
    const curated = educationalContentStore.getAllVideos();
    if (curated && curated.length) {
      setItems(curated);
    } else {
      getResources({ type: 'VIDEO' }).then(setItems).catch(() => {});
    }
  }, [getResources]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((r) =>
      (r.title || '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query)
    );
  }, [items, q]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vidéos</h1>
        <p className="text-sm text-muted-foreground">Tous les contenus vidéo</p>
      </div>

      <Card className="bg-card/60 backdrop-blur">
        <CardContent className="pt-6">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une vidéo…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Résultats ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              ))}
            </div>
          )}
          {error && <div className="text-sm text-red-600">{String(error)}</div>}
          {!isLoading && !error && (
            <div className="divide-y rounded-lg border overflow-hidden">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setCurrent(r)}
                  className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate block">{r.title}</span>
                        {r.isPremium && <Badge variant="secondary" className="text-[10px] uppercase">Premium</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">{r.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {current && (current.mediaUrl || current.url) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <MediaPlayer
              onClose={() => setCurrent(null)}
              title={current.title}
              src={current.mediaUrl || current.url}
              type="video"
            />
          </div>
        </div>
      )}
    </div>
  );
}


