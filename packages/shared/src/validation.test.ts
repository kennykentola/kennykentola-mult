import { describe, it, expect } from 'vitest';
import {
  UserRoleSchema,
  RegisterValidation,
  LoginValidation,
  SubmitPaymentValidation,
  SubmitPrintOrderValidation,
  SolarJobRequestValidation,
  CourseCreateValidation,
  CreatePostValidation,
  CreateCommentValidation
} from './validation';

describe('UserRoleSchema', () => {
  it('accepts valid roles', () => {
    expect(UserRoleSchema.parse('Admin')).toBe('Admin');
    expect(UserRoleSchema.parse('Student')).toBe('Student');
  });

  it('rejects invalid roles', () => {
    expect(() => UserRoleSchema.parse('Hacker')).toThrow();
  });
});

describe('RegisterValidation', () => {
  it('accepts valid input', () => {
    const result = RegisterValidation.parse({
      email: 'Test@Example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(result.email).toBe('test@example.com');
    expect(result.role).toBe('Student');
  });

  it('rejects short password', () => {
    expect(() =>
      RegisterValidation.parse({
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      })
    ).toThrow();
  });

  it('rejects missing fields', () => {
    expect(() => RegisterValidation.parse({})).toThrow();
  });
});

describe('LoginValidation', () => {
  it('accepts valid input', () => {
    expect(LoginValidation.parse({ email: 'a@b.com', password: 'x' })).toEqual({
      email: 'a@b.com',
      password: 'x'
    });
  });

  it('rejects invalid email', () => {
    expect(() => LoginValidation.parse({ email: 'bad', password: 'x' })).toThrow();
  });
});

describe('SubmitPaymentValidation', () => {
  it('accepts valid payment', () => {
    expect(
      SubmitPaymentValidation.parse({
        type: 'solar_job',
        referenceId: 'abc123',
        bankAccountId: 'bank1',
        amount: 1000,
        receiptImage: 'https://example.com/receipt.jpg',
        referenceNumber: 'REF12345'
      })
    ).toBeDefined();
  });

  it('rejects zero amount', () => {
    expect(() =>
      SubmitPaymentValidation.parse({
        type: 'solar_job',
        referenceId: 'abc',
        bankAccountId: 'bank1',
        amount: 0,
        receiptImage: 'https://example.com/x.jpg',
        referenceNumber: 'REF12345'
      })
    ).toThrow();
  });

  it('rejects invalid reference number length', () => {
    expect(() =>
      SubmitPaymentValidation.parse({
        type: 'solar_job',
        referenceId: 'abc',
        bankAccountId: 'bank1',
        amount: 100,
        receiptImage: 'https://example.com/x.jpg',
        referenceNumber: '1234'
      })
    ).toThrow();
  });
});

describe('SubmitPrintOrderValidation', () => {
  it('accepts valid print order', () => {
    expect(
      SubmitPrintOrderValidation.parse({
        fileUrl: 'https://example.com/file.pdf',
        fileType: 'PDF',
        printingType: 'photocopy',
        colorMode: 'mono',
        paperSize: 'A4',
        doubleSided: false,
        quantity: 10
      })
    ).toBeDefined();
  });

  it('rejects non-positive quantity', () => {
    expect(() =>
      SubmitPrintOrderValidation.parse({
        fileUrl: 'https://example.com/file.pdf',
        fileType: 'PDF',
        printingType: 'photocopy',
        quantity: 0
      })
    ).toThrow();
  });
});

describe('SolarJobRequestValidation', () => {
  it('accepts valid solar job request', () => {
    expect(
      SolarJobRequestValidation.parse({
        jobType: 'solar-installation',
        description: 'Install 5kW solar panel system on rooftop',
        address: '123 Main Street, Lagos'
      })
    ).toBeDefined();
  });

  it('rejects short description', () => {
    expect(() =>
      SolarJobRequestValidation.parse({
        jobType: 'solar-installation',
        description: 'Fix it',
        address: '123 Main Street'
      })
    ).toThrow();
  });

  it('rejects short address', () => {
    expect(() =>
      SolarJobRequestValidation.parse({
        jobType: 'solar-installation',
        description: 'Install solar panels for home use',
        address: '12'
      })
    ).toThrow();
  });
});

describe('CourseCreateValidation', () => {
  it('accepts valid course', () => {
    expect(
      CourseCreateValidation.parse({
        title: 'Web Development Bootcamp',
        description: 'Learn full-stack web development with React and Node.js in this comprehensive course.',
        price: 500,
        isPublished: true
      })
    ).toBeDefined();
  });

  it('rejects short title', () => {
    expect(() =>
      CourseCreateValidation.parse({
        title: 'JS',
        description: 'A comprehensive course about JavaScript programming.',
        price: 100
      })
    ).toThrow();
  });
});

describe('CreatePostValidation', () => {
  it('accepts valid post', () => {
    expect(CreatePostValidation.parse({ content: 'Hello world' })).toEqual({
      content: 'Hello world'
    });
  });

  it('rejects empty content', () => {
    expect(() => CreatePostValidation.parse({ content: '   ' })).toThrow();
  });
});

describe('CreateCommentValidation', () => {
  it('accepts valid comment', () => {
    expect(CreateCommentValidation.parse({ content: 'Great post!' })).toEqual({
      content: 'Great post!'
    });
  });

  it('rejects overly long content', () => {
    expect(() =>
      CreateCommentValidation.parse({ content: 'x'.repeat(2001) })
    ).toThrow();
  });
});
