import { useEffect, useMemo, useState } from 'react';
import { useUserResources, UserResourceDto } from '@/lib/apiComponent/hooks/useUserResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, FileText, Search, RefreshCw, Filter, Trophy, Lock, CalendarDays } from 'lucide-react';

export default function MyResources() {
  const { resources, loading, error, list, download, remove } = useUserResources();

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ENGAGEMENT_DOCUMENT' | 'CERTIFICATE'>('ALL');
  const [challengeFilter, setChallengeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initial load
    list().catch(() => {});
  }, [list]);

  // Auto-refresh when filters change (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      setRefreshing(true);
      list({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        challengeId: challengeFilter || undefined,
      }).finally(() => setRefreshing(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [typeFilter, challengeFilter, list]);

  const filtered = useMemo<UserResourceDto[]>(() => {
    const base = Array.isArray(resources) ? resources : [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r: UserResourceDto) => {
      const meta = (r.metadata || {}) as Record<string, unknown>;
      const challengeTitle = typeof meta.challengeTitle === 'string' ? meta.challengeTitle : '';
      return (
        (r.title || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (challengeTitle || '').toLowerCase().includes(q)
      );
    });
  }, [resources, searchQuery]);

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes ressources</h1>
          <p className="text-sm text-muted-foreground">Certificats et documents générés pour vos défis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => list()} disabled={loading || refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/60 backdrop-blur">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, description, challenge…"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'ALL' | 'ENGAGEMENT_DOCUMENT' | 'CERTIFICATE')}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les types</SelectItem>
                  <SelectItem value="ENGAGEMENT_DOCUMENT">Engagement</SelectItem>
                  <SelectItem value="CERTIFICATE">Certificat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="">
              <Input
                placeholder="Filtrer par Challenge ID (optionnel)"
                value={challengeFilter}
                onChange={(e) => setChallengeFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base flex items-center gap-2"><Filter className="w-4 h-4" /> Résultats</CardTitle>
          <div className="text-xs text-muted-foreground">{filtered.length} document(s)</div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-1/2 bg-muted rounded mb-3" />
                  <div className="h-3 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="rounded-full bg-accent p-3 mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Aucune ressource disponible pour le moment. Revenez plus tard ou ajustez vos filtres.
              </p>
            </div>
          )}

          <div className="divide-y rounded-lg border overflow-hidden">
            {filtered.map((r) => {
              const isCert = r.type === 'CERTIFICATE';
              const Icon = isCert ? Trophy : FileText;
              const isAvailable = r.available !== undefined ? r.available : true;
              
              // Pour les certificats, utiliser challengeEndDate pour la disponibilité
              // Sinon utiliser availableAt ou certificateWillBeAvailableAt
              const dateToShow = isCert && r.challengeEndDate
                ? new Date(r.challengeEndDate)
                : isCert && r.certificateWillBeAvailableAt 
                ? new Date(r.certificateWillBeAvailableAt)
                : r.availableAt 
                ? new Date(r.availableAt)
                : undefined;
              
              const availableAtLabel = dateToShow 
                ? `${dateToShow.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : undefined;
              
              const endAt = r.challengeEndDate ? new Date(r.challengeEndDate) : undefined;
              
              return (
                <div key={r.id} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 hover:bg-accent/40 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm sm:text-base break-words">
                          {r.title || `Ressource #${r.id}`}
                        </span>
                        {r.type && (
                          <Badge variant="secondary" className="text-[10px] uppercase flex-shrink-0">{r.type}</Badge>
                        )}
                        {r.challengeEnded && (
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">
                            Challenge terminé{endAt ? ` • ${endAt.toLocaleDateString('fr-FR')}` : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground break-words">
                        {(
                          r.metadata && typeof r.metadata === 'object' && typeof (r.metadata as Record<string, unknown>).challengeTitle === 'string'
                            ? String((r.metadata as Record<string, unknown>).challengeTitle as string)
                            : (r.description || (r.challengeId ? `Challenge: ${r.challengeId}` : 'Document'))
                        )}
                      </div>
                      {!isAvailable && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-start sm:items-center gap-1.5">
                          <Lock className="w-3 h-3 flex-shrink-0 mt-0.5 sm:mt-0" /> 
                          <span className="break-words">
                            {isCert 
                              ? `Certificat disponible le ${availableAtLabel || (endAt ? endAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'à la fin du challenge')}`
                              : `Disponible le ${availableAtLabel || 'plus tard'}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!isAvailable && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground sm:mr-2 sm:hidden lg:flex">
                        <CalendarDays className="w-3 h-3 flex-shrink-0" /> 
                        <span className="whitespace-nowrap text-[10px] sm:text-xs">
                          {isCert && endAt 
                            ? endAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                            : availableAtLabel 
                            ? dateToShow?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                            : (isCert ? 'À la fin du challenge' : 'Plus tard')
                          }
                        </span>
                      </span>
                    )}
                    {isAvailable && (
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        onClick={() => download(r.id)} 
                        title="Télécharger"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={() => remove(r.id)} 
                      title="Supprimer"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


