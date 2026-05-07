
const API_BASE = '/api/tenants';

const request = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Tenants
  getTenant: (slug) => request(`/${slug}`),
  listTenants: () => request('/tenants'),

  // Rooms
  listRooms: (slug) => request(`/${slug}/rooms`),
  getRoom: (slug, id) => request(`/${slug}/rooms/${id}`),
  createRoom: (slug, body) => request(`/${slug}/rooms`, { method: 'POST', body }),
  updateRoom: (slug, id, body) => request(`/${slug}/rooms/${id}`, { method: 'PATCH', body }),
  deleteRoom: (slug, id) => request(`/${slug}/rooms/${id}`, { method: 'DELETE' }),

  // Bookings
  listBookings: (slug) => request(`/${slug}/bookings`),
  createBooking: (slug, body) => request(`/${slug}/bookings`, { method: 'POST', body }),
  checkAvailability: (slug, roomId, start, end) =>
    request(`/${slug}/bookings/available?room_id=${roomId}&start=${start}&end=${end}`),
  deleteBooking: (slug, id) => request(`/${slug}/bookings/${id}`, { method: 'DELETE' }),
};
