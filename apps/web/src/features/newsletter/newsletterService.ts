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
