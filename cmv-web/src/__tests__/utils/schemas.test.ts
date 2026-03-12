import { createResourceSchema, resourceSchema } from '@/utils/schemas/create-resource.schema';
import { createTicketSchema } from '@/utils/schemas/create-ticket.schema';
import { createUserSchema, updateUserSchema } from '@/utils/schemas/create-user.schema';
import { createCostSchema, createVehicleSchema } from '@/utils/schemas/create-vehicle.schema';
import { describe, expect, it } from 'vitest';

// ─── createUserSchema ─────────────────────────────────────────────────────────

describe('createUserSchema', () => {
  const validUser = {
    lastname: 'Doe',
    firstname: 'John',
    email: 'john@example.com',
    password: 'securepassword',
    status: 'ACTIF' as const,
    roleId: 'role-1',
    serviceId: 'service-1',
  };

  it('accepts valid user data', () => {
    expect(() => createUserSchema.parse(validUser)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects empty lastname', () => {
    const result = createUserSchema.safeParse({ ...validUser, lastname: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty firstname', () => {
    const result = createUserSchema.safeParse({ ...validUser, firstname: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status value', () => {
    const result = createUserSchema.safeParse({ ...validUser, status: 'PENDING' });
    expect(result.success).toBe(false);
  });

  it('accepts INACTIF status', () => {
    expect(() => createUserSchema.parse({ ...validUser, status: 'INACTIF' })).not.toThrow();
  });

  it('rejects empty roleId', () => {
    const result = createUserSchema.safeParse({ ...validUser, roleId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty serviceId', () => {
    const result = createUserSchema.safeParse({ ...validUser, serviceId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = createUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(() => updateUserSchema.parse({})).not.toThrow();
  });

  it('accepts partial data', () => {
    expect(() => updateUserSchema.parse({ lastname: 'Smith' })).not.toThrow();
  });

  it('rejects invalid email when provided', () => {
    const result = updateUserSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('rejects empty lastname when provided', () => {
    const result = updateUserSchema.safeParse({ lastname: '' });
    expect(result.success).toBe(false);
  });
});

// ─── createResourceSchema ─────────────────────────────────────────────────────

describe('createResourceSchema', () => {
  const validResource = {
    type: 'Laptop',
    resource: 'Dell XPS',
    location: 'Bureau 1',
    purchase_date: '2024-01-01',
    supplier: 'Dell',
    expired_at: '2027-01-01',
  };

  it('accepts valid resource data', () => {
    expect(() => createResourceSchema.parse(validResource)).not.toThrow();
  });

  it('coerces purchase_date string to Date', () => {
    const result = createResourceSchema.parse(validResource);
    expect(result.purchase_date).toBeInstanceOf(Date);
  });

  it('coerces expired_at string to Date', () => {
    const result = createResourceSchema.parse(validResource);
    expect(result.expired_at).toBeInstanceOf(Date);
  });

  it('rejects missing type', () => {
    const { type: _type, ...rest } = validResource;
    const result = createResourceSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing resource field', () => {
    const { resource: _resource, ...rest } = validResource;
    const result = createResourceSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date', () => {
    const result = createResourceSchema.safeParse({
      ...validResource,
      purchase_date: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });
});

describe('resourceSchema', () => {
  it('accepts valid resource data', () => {
    const validResource = {
      type: 'Laptop',
      resource: 'Dell XPS',
      location: 'Bureau 1',
      purchase_date: '2024-01-01',
      supplier: 'Dell',
      expired_at: '2027-01-01',
    };
    expect(() => resourceSchema.parse(validResource)).not.toThrow();
  });
});

// ─── createVehicleSchema ──────────────────────────────────────────────────────

describe('createVehicleSchema', () => {
  const validVehicle = {
    brand: 'Toyota',
    state: 'AVAILABLE' as const,
    kilometres: '50000',
    model: 'Corolla',
    year: 2022,
    maintenance_date: '2024-06-01',
  };

  it('accepts valid vehicle data', () => {
    expect(() => createVehicleSchema.parse(validVehicle)).not.toThrow();
  });

  it('coerces maintenance_date to Date', () => {
    const result = createVehicleSchema.parse(validVehicle);
    expect(result.maintenance_date).toBeInstanceOf(Date);
  });

  it('rejects invalid state', () => {
    const result = createVehicleSchema.safeParse({ ...validVehicle, state: 'BROKEN' });
    expect(result.success).toBe(false);
  });

  it('accepts IN_USE state', () => {
    expect(() => createVehicleSchema.parse({ ...validVehicle, state: 'IN_USE' })).not.toThrow();
  });

  it('accepts IN_REPAIR state', () => {
    expect(() => createVehicleSchema.parse({ ...validVehicle, state: 'IN_REPAIR' })).not.toThrow();
  });

  it('rejects non-number year', () => {
    const result = createVehicleSchema.safeParse({ ...validVehicle, year: 'twenty-twenty' });
    expect(result.success).toBe(false);
  });

  it('rejects missing brand', () => {
    const { brand: _brand, ...rest } = validVehicle;
    const result = createVehicleSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('createCostSchema', () => {
  const validCost = {
    vehicleId: 'vehicle-1',
    description: 'Oil change',
    cost: '150.00',
    maintenance_date: '2024-06-01',
  };

  it('accepts valid cost data', () => {
    expect(() => createCostSchema.parse(validCost)).not.toThrow();
  });

  it('coerces maintenance_date to Date', () => {
    const result = createCostSchema.parse(validCost);
    expect(result.maintenance_date).toBeInstanceOf(Date);
  });

  it('rejects missing vehicleId', () => {
    const { vehicleId: _v, ...rest } = validCost;
    const result = createCostSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ─── createTicketSchema ───────────────────────────────────────────────────────

describe('createTicketSchema', () => {
  const validTicket = {
    employeeId: 'emp-1',
    priority: 'HIGT' as const,
    description: 'Printer is broken',
    materialId: 'mat-1',
  };

  it('accepts valid ticket data', () => {
    expect(() => createTicketSchema.parse(validTicket)).not.toThrow();
  });

  it('accepts all optional fields', () => {
    const full = {
      ...validTicket,
      status: 'TODO' as const,
      serviceId: 'service-1',
      resolvedById: 'user-1',
      assignId: 'user-2',
      validated_at: '2024-06-01T12:00:00Z',
    };
    expect(() => createTicketSchema.parse(full)).not.toThrow();
  });

  it('rejects missing employeeId', () => {
    const { employeeId: _e, ...rest } = validTicket;
    const result = createTicketSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing materialId', () => {
    const { materialId: _m, ...rest } = validTicket;
    const result = createTicketSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = createTicketSchema.safeParse({ ...validTicket, priority: 'URGENT' });
    expect(result.success).toBe(false);
  });

  it('accepts HIGT priority (typo in schema is intentional)', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, priority: 'HIGT' })).not.toThrow();
  });

  it('accepts MEDIUM priority', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, priority: 'MEDIUM' })).not.toThrow();
  });

  it('accepts LOW priority', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, priority: 'LOW' })).not.toThrow();
  });

  it('rejects invalid status when provided', () => {
    const result = createTicketSchema.safeParse({ ...validTicket, status: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid status values', () => {
    const statuses = [
      'TODO',
      'IN_PROGRESS',
      'CLOSED',
      'IN_VALIDATE',
      'VALIDE',
      'NOT_VALIDATE',
    ] as const;
    for (const status of statuses) {
      expect(() => createTicketSchema.parse({ ...validTicket, status })).not.toThrow();
    }
  });
});
