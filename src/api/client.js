
const API_BASE = '/api';

const request = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Tenants
  getTenant: (slug) => request(`/tenants/${slug}`),
  listTenants: () => request('/tenants'),

  // Rooms
  listRooms: (slug) => request(`/tenants/${slug}/rooms`),
  getRoom: (slug, id) => request(`/tenants/${slug}/rooms/${id}`, { method: 'POST', body: { roomId: id } }),
  createRoom: (slug, body) => request(`/tenants/${slug}/rooms/new`, { method: 'POST', body }),
  updateRoom: (slug, id, body) => request(`/tenants/${slug}/rooms/${id}`, { method: 'PATCH', body }),
  deleteRoom: (slug, id) => request(`/tenants/${slug}/rooms/${id}`, { method: 'DELETE' }),

  // Bookings
  listBookings: (slug) => request(`/tenants/${slug}/bookings`),
  createBooking: (slug, body) => request(`/tenants/${slug}/bookings`, { method: 'POST', body }),
  checkAvailability: (slug, roomId, start, end) =>
    request(`/tenants/${slug}/bookings/available?room_id=${roomId}&start=${start}&end=${end}`),
  deleteBooking: (slug, id) => request(`/tenants/${slug}/bookings/${id}`, { method: 'DELETE' }),

  // Page Blocks (admin)
  getPageBlocks: (slug) => request(`/tenants/${slug}/page-blocks`),
  createPageBlock: (slug, body) => request(`/tenants/${slug}/page-blocks`, { method: 'POST', body }),
  updatePageBlock: (slug, id, body) => request(`/tenants/${slug}/page-blocks/${id}`, { method: 'PATCH', body }),
  deletePageBlock: (slug, id) => request(`/tenants/${slug}/page-blocks/${id}`, { method: 'DELETE' }),
  reorderPageBlocks: (slug, items) => request(`/tenants/${slug}/page-blocks/reorder`, { method: 'PATCH', body: { items } }),

  // Public page (no auth)
  getPublicPage: (slug) => request(`/tenants/${slug}/page`),
};
