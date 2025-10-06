📄 Documentation API Client et Hooks React
# Documentation API Client & Hooks React

Ce document présente un **système complet d'appel API pour React JS** avec :  
- Gestion centralisée du **token JWT**  
- Validation des réponses avec **Zod**  
- Gestion des erreurs avec `ApiError`  
- Hooks React (`useGet`, `usePost`, `usePut`, `usePatch`, `useDelete`)  
- Exemples CRUD complets  

---

## 1️⃣ Installation

Installe les dépendances nécessaires :

```bash
npm install zod


Place les fichiers suivants dans ton projet :

utils/apiClient.ts

hooks/useApi.ts

2️⃣ apiClient.ts
🔹 Structure
import { ZodSchema } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Gestion centralisée du token
let authToken: string | undefined = undefined;

export const tokenManager = {
  setToken: (token: string) => { authToken = token; document.cookie = `jwt=${token}; path=/`; },
  getToken: () => authToken ?? document.cookie.match(/(^| )jwt=([^;]+)/)?.[2],
  clearToken: () => { authToken = undefined; document.cookie = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`; },
};

interface ApiOptions<T = any> {
  body?: T;
  headers?: Record<string, string>;
  token?: string;
  schema?: ZodSchema;
}

export async function apiClient<TResponse = any, TBody = any>(
  url: string,
  method: HttpMethod,
  options: ApiOptions<TBody> = {}
): Promise<TResponse> {
  // implémentation avec JWT, Zod et gestion d'erreurs
}

🔹 Helpers par méthode
export const api = {
  get: <T>(url: string, schema?: ZodSchema) => apiClient<T>(url, "GET", { schema }),
  post: <T, B>(url: string, body: B, schema?: ZodSchema) => apiClient<T, B>(url, "POST", { body, schema }),
  put: <T, B>(url: string, body: B, schema?: ZodSchema) => apiClient<T, B>(url, "PUT", { body, schema }),
  patch: <T, B>(url: string, body: B, schema?: ZodSchema) => apiClient<T, B>(url, "PATCH", { body, schema }),
  delete: <T>(url: string, schema?: ZodSchema) => apiClient<T>(url, "DELETE", { schema }),
};

🔹 Gestion du token
import { tokenManager } from "@/utils/apiClient";

tokenManager.setToken("mon-jwt");  // enregistrer
const token = tokenManager.getToken();  // récupérer
tokenManager.clearToken(); // supprimer

3️⃣ useApi.ts - Hooks React
🔹 Hooks disponibles
useGet<T>(url: string, schema?: ZodSchema);
usePost<T, B>(url: string, schema?: ZodSchema, body?: B);
usePut<T, B>(url: string, schema?: ZodSchema, body?: B);
usePatch<T, B>(url: string, schema?: ZodSchema, body?: B);
useDelete<T>(url: string, schema?: ZodSchema);

🔹 Hook de base
function useApiBase<TResponse, TBody>(
  url: string,
  method: HttpMethod,
  options: { body?: TBody; schema?: ZodSchema; immediate?: boolean }
)


immediate : exécution automatique (true par défaut pour GET)

execute() : fonction pour lancer manuellement la requête

4️⃣ Exemple CRUD complet React
🔹 Schemas Zod
import { z } from "zod";

const userSchema = z.object({ id: z.string(), name: z.string(), email: z.string() });
const usersSchema = z.array(userSchema);
type User = z.infer<typeof userSchema>;

🔹 Page React
import React, { useState } from "react";
import { useGet, usePost, useDelete } from "@/hooks/useApi";
import { tokenManager } from "@/utils/apiClient";

export default function UsersPage() {
  // GET
  const { data: users, loading: loadingUsers, execute: refetchUsers } = useGet("/api/users", usersSchema);

  // POST
  const { execute: createUser, loading: creatingUser } = usePost("/api/users", userSchema);

  // DELETE
  const { execute: deleteUser, loading: deletingUser } = useDelete("/api/users/:id");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      <h1>CRUD Utilisateurs</h1>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={async () => { await createUser({ name, email }); refetchUsers(); }}>
        {creatingUser ? "Création..." : "Créer"}
      </button>

      <ul>
        {users?.map(u => (
          <li key={u.id}>
            {u.name} ({u.email})
            <button onClick={async () => { await deleteUser(`/api/users/${u.id}`); refetchUsers(); }}>
              {deletingUser ? "Suppression..." : "Supprimer"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

5️⃣ Avantages

✅ Token centralisé : tokenManager

✅ Validation runtime : Zod

✅ Typed Hooks React : autocomplétion + sécurité TS

✅ Gestion d’erreurs uniforme avec ApiError

✅ CRUD complet prêt à l’emploi

6️⃣ Bonnes pratiques

Toujours valider les réponses avec Zod pour éviter les erreurs runtime.

Utiliser tokenManager.setToken() après login.

Rafraîchir les données après POST/PUT/DELETE avec execute() ou refetch.

Gérer les loading et error pour chaque hook séparément.