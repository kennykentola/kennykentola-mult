export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      // In Phase 2: Send this to the Express backend or Appwrite 'newsletter_subscribers' collection
      console.log('Subscribed email:', email);
      resolve({ success: true, message: 'Subscribed successfully!' });
    }, 1000);
  });
}
