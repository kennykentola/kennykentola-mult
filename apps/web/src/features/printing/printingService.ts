// Printing Service — API communication layer

import type { PrintOrder, PricingConfig, CreateOrderPayload } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_jwt') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ──────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────

/** Fetch active pricing configuration */
export async function getPricing(): Promise<PricingConfig[]> {
  const data = await fetchWithAuth(`${API_BASE}/printing/pricing`);
  return data.pricing;
}

// ──────────────────────────────────────────────
// Customer (authenticated)
// ──────────────────────────────────────────────

/** Create a new print order */
export async function createOrder(payload: CreateOrderPayload): Promise<PrintOrder> {
  const data = await fetchWithAuth(`${API_BASE}/printing/orders`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.order;
}

/** Get current user's orders */
export async function getMyOrders(): Promise<{ orders: PrintOrder[]; total: number }> {
  return fetchWithAuth(`${API_BASE}/printing/orders`);
}

/** Get single order by ID */
export async function getOrder(orderId: string): Promise<PrintOrder> {
  const data = await fetchWithAuth(`${API_BASE}/printing/orders/${orderId}`);
  return data.order;
}

// ──────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────

/** Admin: list all orders with optional status filter */
export async function getAdminOrders(
  status?: string,
  limit?: number
): Promise<{ orders: PrintOrder[]; total: number }> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (limit) params.set('limit', String(limit));
  return fetchWithAuth(`${API_BASE}/printing/admin/orders?${params}`);
}

/** Admin: update order status / price */
export async function updateOrderStatus(
  orderId: string,
  update: { status?: string; price?: number; estimatedReadyAt?: string }
): Promise<PrintOrder> {
  const data = await fetchWithAuth(`${API_BASE}/printing/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
  return data.order;
}
