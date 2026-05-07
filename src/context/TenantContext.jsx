
import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { tenantSlug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantSlug) { setLoading(false); return; }
    setLoading(true);
    api.listTenants()
      .then((data) => {
        const found = data.data.find((t) => t.slug === tenantSlug);
        setTenant(found || null);
        setLoading(false);
      })
      .catch(() => { setTenant(null); setLoading(false); });
  }, [tenantSlug]);

  return (
    <TenantContext.Provider value={{ tenant, loading, tenantSlug }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
