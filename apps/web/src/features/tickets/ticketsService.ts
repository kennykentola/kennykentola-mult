import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getSessionJwt();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface TicketRequest {
  subject: string;
  description: string;
  priority?: string;
  projectOrContractId?: string;
}

export async function createTicket(payload: TicketRequest) {
  const data = await fetchWithAuth(`${API_BASE}/tickets/requests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.ticket;
}

export async function getMyTickets() {
  const data = await fetchWithAuth(`${API_BASE}/tickets`);
  return data.tickets;
}

export async function getTicketDetails(ticketId: string) {
  const data = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}`);
  return data;
}

export async function sendTicketMessage(ticketId: string, content: string, fileUrl?: string) {
  const data = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, fileUrl })
  });
  return data.message;
}

export async function getAdminAllTickets() {
  const data = await fetchWithAuth(`${API_BASE}/tickets/admin/all`);
  return data.tickets;
}

export async function updateAdminTicketStatus(ticketId: string, update: { status?: string, priority?: string, assignedTo?: string }) {
  const data = await fetchWithAuth(`${API_BASE}/tickets/admin/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(update)
  });
  return data.ticket;
}
