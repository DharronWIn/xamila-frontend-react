import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCoaching } from "@/lib/apiComponent/hooks/useAdmin";
import { CoachingRequest } from "@/types/admin";
import { toast } from "sonner";

type CoachingStatus = "PENDING" | "IN_PROGRESS" | "ACCEPTED" | "DECLINED" | "COMPLETED";

export default function CoachingRequestsManagement() {
  const {
    requests,
    isLoading,
    error,
    pagination,
    getCoachingRequests,
    updateCoachingRequestStatus
  } = useAdminCoaching();

  const [status, setStatus] = useState<"ALL" | CoachingStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        await getCoachingRequests({
          page,
          limit,
          status: status === "ALL" ? undefined : status,
          search: search || undefined
        });
      } catch (err) {
        console.error("Erreur lors du chargement des demandes:", err);
        toast.error("Erreur lors du chargement des demandes");
      }
    };

    loadRequests();
  }, [page, limit, status, search, getCoachingRequests]);

  const handleUpdateStatus = async (id: string, newStatus: CoachingStatus) => {
    try {
      await updateCoachingRequestStatus(id, { status: newStatus });
      toast.success("Statut mis à jour avec succès");
      // Recharger les données
      await getCoachingRequests({
        page,
        limit,
        status: status === "ALL" ? undefined : status,
        search: search || undefined
      });
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Demandes de coaching</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Recherche (email, sujet, message)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="RESOLVED">Résolu</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Par page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setPage(1)}>Appliquer</Button>
            <Button variant="outline" onClick={() => { setSearch(""); setStatus("ALL"); setPage(1); }}>Réinitialiser</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résultats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Chargement…</div>
          ) : error ? (
            <div className="py-10 text-center text-red-600">{error}</div>
          ) : (!requests || requests.length === 0) ? (
            <div className="py-10 text-center text-muted-foreground">Aucune demande</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Utilisateur</th>
                    <th className="py-2 pr-3">Sujet</th>
                    <th className="py-2 pr-3">Message</th>
                    <th className="py-2 pr-3">Créée</th>
                    <th className="py-2 pr-3">Statut</th>
                    <th className="py-2 pr-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(requests || []).map((r) => (
                    <tr key={r.id} className="border-b align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{r.userEmail || r.userId || "—"}</td>
                      <td className="py-2 pr-3 min-w-[180px]">{r.subject}</td>
                      <td className="py-2 pr-3 min-w-[260px] max-w-[520px]">
                        <div className="line-clamp-3 text-muted-foreground">{r.message}</div>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        <span className="rounded px-2 py-0.5 bg-gray-100 text-gray-700 text-xs">{r.status}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Select value={r.status} onValueChange={(v) => handleUpdateStatus(r.id, v as CoachingStatus)}>
                            <SelectTrigger className="h-8 w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">En attente</SelectItem>
                              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                              <SelectItem value="ACCEPTED">Accepté</SelectItem>
                              <SelectItem value="DECLINED">Refusé</SelectItem>
                              <SelectItem value="COMPLETED">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                          {r.status !== "IN_PROGRESS" && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(r.id, "IN_PROGRESS")}>Marquer en cours</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {page} / {totalPages} • {pagination.total || 0} résultat(s)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >Précédent</Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >Suivant</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


