import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Validate Appwrite Webhook Signature here in production to ensure authenticity
    const eventHeader = req.headers.get('x-appwrite-event');
    
    console.log('[Webhook Received]', eventHeader);
    console.log('[Payload]', payload);

    if (eventHeader?.includes('databases.*.collections.tickets.documents.*.create')) {
      // Logic for new ticket created
      // e.g. Trigger an email via Resend or SendGrid to the Admin
      console.log('Sending admin email for new ticket:', payload.$id);
    }
    
    if (eventHeader?.includes('databases.*.collections.solar_jobs.documents.*.update')) {
      // Logic for job status update
      console.log('Solar Job Updated:', payload.$id, payload.status);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}
