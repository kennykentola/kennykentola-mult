import { getSessionJwt } from '../../lib/sessionJwt';

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, segment: 'general' }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe');
    }

    return { success: true, message: data.message };
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return { success: false, message: error.message || 'An error occurred' };
  }
}

export async function sendBroadcast(subject: string, html: string, segment: string = 'all'): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getSessionJwt();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subject, html, segment }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send broadcast');
    }

    return { success: true, message: data.message };
  } catch (error: any) {
    console.error('Newsletter broadcast error:', error);
    return { success: false, message: error.message || 'An error occurred' };
  }
}

export async function fetchSubscribers(): Promise<{ success: boolean; subscribers?: any[]; message?: string }> {
  try {
    const token = await getSessionJwt();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch subscribers');
    }

    return { success: true, subscribers: data.subscribers };
  } catch (error: any) {
    console.error('Newsletter get subscribers error:', error);
    return { success: false, message: error.message || 'An error occurred' };
  }
}
