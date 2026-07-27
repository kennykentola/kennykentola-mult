import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CourseRatingModal from './CourseRatingModal';
import * as api from '../academy/api';
import * as AuthContext from '../auth/AuthContext';

// Mock the API calls
vi.mock('../academy/api', () => ({
  fetchCourseTestimonials: vi.fn(),
  submitTestimonial: vi.fn(),
}));

// Mock the AuthContext
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('CourseRatingModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmitted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      profile: { userId: 'user123' }
    });
  });

  it('does not render while checking if already reviewed', () => {
    // Return a promise that never resolves to simulate loading
    vi.mocked(api.fetchCourseTestimonials).mockReturnValue(new Promise(() => {}));
    
    const { container } = render(
      <CourseRatingModal courseId="c1" courseTitle="Test Course" onClose={mockOnClose} onSubmitted={mockOnSubmitted} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly if not reviewed yet', async () => {
    vi.mocked(api.fetchCourseTestimonials).mockResolvedValueOnce({ testimonials: [] });

    render(
      <CourseRatingModal courseId="c1" courseTitle="Test Course" onClose={mockOnClose} onSubmitted={mockOnSubmitted} />
    );

    await waitFor(() => {
      expect(screen.getByText('Congratulations! 🎉')).toBeDefined();
    });
    
    expect(screen.getByText(/You've completed/)).toBeDefined();
    expect(screen.getByText('Test Course')).toBeDefined();
  });

  it('auto-submits and closes if user already reviewed', async () => {
    vi.mocked(api.fetchCourseTestimonials).mockResolvedValueOnce({ 
      testimonials: [{ userId: 'user123', authorName: 'Test User', content: 'Great', rating: 5, isApproved: true, createdAt: '' }] 
    });

    const { container } = render(
      <CourseRatingModal courseId="c1" courseTitle="Test Course" onClose={mockOnClose} onSubmitted={mockOnSubmitted} />
    );

    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalled();
    });
    
    // It should render nothing since hasReviewed becomes true
    expect(container.firstChild).toBeNull();
  });

  it('allows user to submit a rating', async () => {
    vi.mocked(api.fetchCourseTestimonials).mockResolvedValueOnce({ testimonials: [] });
    vi.mocked(api.submitTestimonial).mockResolvedValueOnce({ message: 'OK', testimonial: {} as any });

    render(
      <CourseRatingModal courseId="c1" courseTitle="Test Course" onClose={mockOnClose} onSubmitted={mockOnSubmitted} />
    );

    // Wait for it to finish checking
    await waitFor(() => {
      expect(screen.getByText('Submit Review')).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText('Write a brief review about what you learned...');
    fireEvent.change(textarea, { target: { value: 'Awesome course' } });

    // Click 4th star (stars are buttons with aria-label)
    const starButton = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(starButton);

    const submitBtn = screen.getByText('Submit Review');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.submitTestimonial).toHaveBeenCalledWith('c1', { content: 'Awesome course', rating: 4 });
      expect(mockOnSubmitted).toHaveBeenCalled();
    });
  });
});
