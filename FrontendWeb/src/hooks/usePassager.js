// src/hooks/usePassager.js
import { useState } from "react";

/**
 * Hook simple de gestion des utilisateurs/passagers.
 * Les exports (CSV/Word/PDF) sont maintenant centralisés dans:
 * - src/lib/export/exporters.js
 * - src/components/shared/ExportDropdown.jsx
 */
const useUsers = (initialUsers = []) => {
  const [users, setUsers] = useState(Array.isArray(initialUsers) ? initialUsers : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setInitialUsers = (arr = []) => setUsers(Array.isArray(arr) ? arr : []);

  // TODO API (admin/passagers):
  // Remplacer fetchFromApi par apiClient + API_ROUTES.passengers.list
  // Voir: src/services/apiClient.js et src/services/apiRoutes.js
  const fetchFromApi = async (url, options) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setUsers(list);
      return list;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Toggle status (retourne l'utilisateur mis à jour)
  const toggleStatus = (userId) => {
    let updatedUser = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          updatedUser = {
            ...u,
            status: u.status === "active" ? "inactive" : "active",
          };
          return updatedUser;
        }
        return u;
      })
    );
    return updatedUser;
  };

  return {
    users,
    setInitialUsers,
    fetchFromApi,
    toggleStatus,
    loading,
    error,
  };
};

export default useUsers;
