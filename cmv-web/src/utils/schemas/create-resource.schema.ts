import { z } from 'zod';

export const createResourceSchema = z.object({
  type: z.string().describe('Type'),
  resource: z.string().describe('Ressource'),
  location: z.string().describe('Localisation'),
  purchase_date: z.coerce.date().describe("Date d'achat"),
  supplier: z.string().describe('Fournisseur'),
  expired_at: z.coerce.date().describe("Date d'expiration"),
});

export const resourceSchema = z.object({
  type: z.string().describe('Type'),
  resource: z.string().describe('Ressource'),
  location: z.string().describe('Localisation'),
  purchase_date: z.coerce.date().describe("Date d'achat"),
  supplier: z.string().describe('Fournisseur'),
  expired_at: z.coerce.date().describe("Date d'expiration"),
});
