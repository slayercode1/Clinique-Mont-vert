import request from 'supertest';
import gateway from '../src/app';
import { describe, expect, beforeAll, it, afterAll } from '@jest/globals';
import prisma from '../src/utils/prisma';


describe('API Endpoints Resources', () => {
  let token: string;
  let userId: string;
  let resourceId: string;

  beforeAll(async () => {
    // Connecte-toi et récupère le token
    const loginResponse = await request(gateway).post('/it/sign-in').send({
      email: 'support@technique.com',
      password: 'Jx8QKYJ3Jqgz?sPn#n',
    });

    // Vérifie si la connexion a réussi et récupère le token
    token = loginResponse.body.data?.token;
    userId = loginResponse.body.data?.id;
  });

  describe('getResources', () => {
    it('should return a list of resources', async () => {
      const response = await request(gateway)
        .get('/it/resources')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(response.body.data);
    });
  });

  describe('createResource', () => {
    it('should create a new resource', async () => {
      const response = await request(gateway)
        .post('/it/resource')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'Type1',
          resource: 'Resource1',
          purchase_date: new Date(),
          location: 'Location1',
          supplier: 'Supplier1',
          state: 'IN_USE',
          expired_at: new Date(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(response.body.data);

      resourceId = response.body.data.id
      
    });
  });

  describe('updateResource', () => {
    it('should update an existing resource', async () => {
      const updatedData = { type: 'UpdatedType' };

      const response = await request(gateway)
        .patch(`/it/resource/${resourceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(response.body.data);
    });

    it('should return 404 if resource not found', async () => {
      const id = resourceId + 'crkik';

      const response = await request(gateway)
        .patch(`/it/resource/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'UpdatedType' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "La ressource n'a pas etait trouver"
      );
    });
  });

  afterAll(async () => {

    await prisma.material.delete({
      where: {
        id: resourceId
      }
    })

    // Déconnexion après le test
    await request(gateway)
      .post(`/it/sign-out/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  });
});
