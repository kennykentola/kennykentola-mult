import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { jwt } = await req.json();

    if (!jwt) {
      return NextResponse.json({ error: 'JWT is required' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    
    // Set the cookie
    response.cookies.set({
      name: 'jwt_token',
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('jwt_token');

  return response;
}
