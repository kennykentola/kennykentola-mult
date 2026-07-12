import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChatView } from './ChatView';
import * as AuthContext from '@/features/auth/AuthContext';
import * as SocketContext from './SocketContext';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./SocketContext', () => ({
  useSocket: vi.fn(),
}));

describe('ChatView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (AuthContext.useAuth as any).mockReturnValue({
      user: { $id: 'user123', email: 'test@example.com' },
      profile: { userId: 'user123', firstName: 'Test', lastName: 'User' }
    });

    (SocketContext.useSocket as any).mockReturnValue({
      socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
      isConnected: true,
      onlineUsers: ['user123']
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rooms: [], isMember: false })
    });
  });

  it('renders without crashing', () => {
    render(<ChatView />);
    // The chat view should have a search input or a message area
    expect(screen.getByPlaceholderText(/Search users/i)).toBeDefined();
  });
});
