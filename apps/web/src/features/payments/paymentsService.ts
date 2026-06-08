// Payments Service — Frontend API communication layer

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

/** Fetch all active bank accounts */
export async function getBankAccounts() {
  const data = await fetchWithAuth(`${API_BASE}/payments/banks`);
  return data.bankAccounts;
}

/** Fetch unpaid invoices (courses with price > 0, quoted printing orders) */
export async function getUnpaidInvoices() {
  const data = await fetchWithAuth(`${API_BASE}/payments/unpaid`);
  return data.invoices;
}

/** Upload receipt screenshot to Appwrite Storage */
export async function uploadReceipt(base64Data: string, filename: string): Promise<string> {
  const data = await fetchWithAuth(`${API_BASE}/payments/upload-receipt`, {
    method: 'POST',
    body: JSON.stringify({ file: base64Data, filename }),
  });
  return data.url;
}

/** Submit bank transfer payment proof for review */
export async function submitPayment(payload: {
  type: string;
  referenceId: string;
  bankAccountId: string;
  amount: number;
  receiptImage: string;
  referenceNumber: string;
}) {
  const data = await fetchWithAuth(`${API_BASE}/payments/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.payment;
}

/** Fetch user's payment history */
export async function getPaymentHistory() {
  const data = await fetchWithAuth(`${API_BASE}/payments/history`);
  return data.payments;
}

/** ADMIN: Fetch all pending payments */
export async function getAdminPendingPayments() {
  const data = await fetchWithAuth(`${API_BASE}/payments/admin/pending`);
  return data.payments;
}

/** ADMIN: Settle/Verify a manual payment */
export async function verifyPayment(paymentId: string) {
  const data = await fetchWithAuth(`${API_BASE}/payments/admin/${paymentId}/verify`, {
    method: 'POST',
  });
  return data;
}

/** ADMIN: Reject/Decline a manual payment */
export async function rejectPayment(paymentId: string, reason: string) {
  const data = await fetchWithAuth(`${API_BASE}/payments/admin/${paymentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return data;
}
