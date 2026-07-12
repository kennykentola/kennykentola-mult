import { Page } from '@playwright/test';

type Role = 'Super Admin' | 'Admin' | 'Instructor' | 'Printer Operator' | 'Mentor' | 'Student';

interface MockAuthOptions {
  role?: Role;
  purpose?: 'learn' | 'hire' | 'print' | 'both' | 'academic' | 'maintenance';
}

export async function mockAuthenticatedSession(page: Page, options: MockAuthOptions = {}) {
  const { role = 'Student', purpose = 'learn' } = options;

  const mockProfile = {
    $id: 'mock-profile-id',
    userId: 'mock-user-id',
    firstName: 'Test',
    lastName: role,
    email: 'test@example.com',
    role: role,
    purpose: purpose,
    phoneNumber: '+1234567890',
  };

  const mockUser = {
    $id: 'mock-user-id',
    name: `Test ${role}`,
    email: 'test@example.com',
    status: true,
    emailVerification: true,
  };

  // 1. Mock Appwrite Account GET (Called by checkUserSession)
  await page.route('**/v1/account**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser)
      });
    } else {
      await route.continue();
    }
  });

  // 2. Mock Appwrite Create JWT
  await page.route('**/v1/account/jwt**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ jwt: 'mock-jwt-token' })
      });
    } else {
      await route.continue();
    }
  });

  // 3. Mock Next.js Session Sync API
  await page.route('**/api/auth/session**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    } else if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    } else {
      await route.continue();
    }
  });

  // 4. Mock Backend Profile API
  await page.route('**/api/v1/auth/profile**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: mockUser,
          profile: mockProfile
        })
      });
    } else {
      await route.continue();
    }
  });

  // 5. Optionally, we might need to mock /api/v1/academy/courses and others
  // for the specific journeys, but we can do that in the specific test files.
}
