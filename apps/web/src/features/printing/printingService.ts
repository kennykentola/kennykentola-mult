// Printing Service — API communication layer

import type { PrintOrder, PricingConfig, CreateOrderPayload, PrintMessage } from './types';
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

/** Upload payment receipt */
export async function uploadReceipt(orderId: string, receiptUrl: string): Promise<PrintOrder> {
  const data = await fetchWithAuth(`${API_BASE}/printing/orders/${orderId}/receipt`, {
    method: 'PATCH',
    body: JSON.stringify({ receiptUrl })
  });
  return data.order;
}

/** Get order messages */
export async function getMessages(orderId: string): Promise<PrintMessage[]> {
  const data = await fetchWithAuth(`${API_BASE}/printing/orders/${orderId}/messages`);
  return data.messages;
}

/** Send message */
export async function sendMessage(orderId: string, message: string): Promise<PrintMessage> {
  const data = await fetchWithAuth(`${API_BASE}/printing/orders/${orderId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  return data.message;
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
  update: { status?: string; price?: number; estimatedReadyAt?: string; deliverableUrl?: string; }
): Promise<PrintOrder> {
  const data = await fetchWithAuth(`${API_BASE}/printing/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
  return data.order;
}

/** Admin: verify payment */
export async function verifyPayment(orderId: string, paymentStatus: 'paid' | 'rejected'): Promise<PrintOrder> {
  const data = await fetchWithAuth(`${API_BASE}/printing/admin/orders/${orderId}/verify-payment`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentStatus })
  });
  return data.order;
}

// ──────────────────────────────────────────────
// POD Catalog (Admin & Public)
// ──────────────────────────────────────────────

export interface PodItem {
  $id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  basePrice: number;
  status: 'active' | 'draft';
  createdAt?: string;
}

export async function getPublicPodCatalog(): Promise<PodItem[]> {
  const data = await fetch(`${API_BASE}/printing/pod`).then(res => res.json());
  return data.catalog || [];
}

export async function getAdminPodCatalog(): Promise<PodItem[]> {
  const data = await fetchWithAuth(`${API_BASE}/printing/admin/pod`);
  return data.catalog || [];
}

export async function createPodItem(item: Partial<PodItem>): Promise<PodItem> {
  const data = await fetchWithAuth(`${API_BASE}/printing/admin/pod`, {
    method: 'POST',
    body: JSON.stringify(item)
  });
  return data.item;
}

export async function updatePodItem(id: string, item: Partial<PodItem>): Promise<PodItem> {
  const data = await fetchWithAuth(`${API_BASE}/printing/admin/pod/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
  return data.item;
}

export async function deletePodItem(id: string): Promise<void> {
  await fetchWithAuth(`${API_BASE}/printing/admin/pod/${id}`, {
    method: 'DELETE'
  });
}

// ──────────────────────────────────────────────
// Pricing Config (Admin)
// ──────────────────────────────────────────────

export async function updatePricingConfig(id: string, data: Partial<PricingConfig>): Promise<PricingConfig> {
  const res = await fetchWithAuth(`${API_BASE}/printing/admin/pricing/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res.item;
}

export async function getPricingConfig() {
  const res = await fetch(`${API_BASE}/printing/pricing`);
  return res.json();
}

