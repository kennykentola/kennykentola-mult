import { NextResponse } from 'next/server';
import { adminAppwrite } from '@/lib/appwrite-server';

export async function POST(req: Request) {
  try {
    const { paymentId, adminUserId } = await req.json();

    if (!paymentId || !adminUserId) {
      return NextResponse.json({ error: 'Missing paymentId or adminUserId' }, { status: 400 });
    }

    // Verify admin privileges (In a real app, verify the token or headers)
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
    
    // Using Admin SDK to bypass client-side RBAC for this critical operation
    const payment = await adminAppwrite.databases.updateDocument(
      dbId,
      'payments',
      paymentId,
      {
        status: 'verified',
        verifiedBy: adminUserId,
        verifiedAt: new Date().toISOString(),
      }
    );

    // Depending on payment.type, trigger downstream logic:
    // e.g. if payment.type === 'course', update course_enrollments

    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    console.error('Payment verification failed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
