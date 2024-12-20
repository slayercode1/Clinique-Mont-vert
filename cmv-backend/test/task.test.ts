// import request from 'supertest';
// import gateway from '../src/app';
// import { describe, expect, beforeAll, it, afterAll } from '@jest/globals';


// describe('API Endpoints Fleet', () => {
//   let token: string;
//   let userId: string;

//   beforeAll(async () => {
//     // Connecte-toi et récupère le token
//     const loginResponse = await request(gateway).post('/it/sign-in').send({
//       email: 'support@technique.com',
//       password: 'Jx8QKYJ3Jqgz?sPn#n',
//     });

//     // Vérifie si la connexion a réussi et récupère le token
//     token = loginResponse.body.data?.token;
//     userId = loginResponse.body.data?.id;
//   });

//   describe('GET /tickets', () => {
//     it('should return a list of tickets', async () => {
//       const response = await request(gateway)
//         .get('/it/tickets')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//     });
//   });

//   describe('GET /ticket/:id', () => {
//     it('should return a single ticket', async () => {
//       const ticketId = 'cm374u1n70001lmwpny9wstyh';
//       const response = await request(gateway)
//         .get(`/it/ticket/${ticketId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.id).toBe(ticketId);
//     });

//     it('should return 404 if ticket not found', async () => {
//       const response = await request(gateway)
//         .get('/it/ticket/cm374u1n70001lmwpny9wsty')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("La tâche n'a pas était trouver ");
//     });
//   });

//   describe('POST /ticket', () => {
//     it('should create a new ticket', async () => {
//       const mockTicket = {
//         description: 'Test description',
//         priority: 'HIGT',
//         service: 'IT',
//         employeeId: userId,
//         materialId: 'cm35oge6m0001mt9b04crkikg',
//         assignId: userId,
//       };

//       const response = await request(gateway)
//         .post('/it/ticket')
//         .set('Authorization', `Bearer ${token}`)
//         .send(mockTicket);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//     });
//   });

//   describe('PATCH /ticket/:id', () => {
//     it('should update a ticket', async () => {
//       const ticketId = 'cm374u1n70001lmwpny9wstyh';
//       const response = await request(gateway)
//         .patch(`/it/ticket/${ticketId}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           description: 'Updated description',
//         });

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.decription).toBe('Updated description');
//     });

//     it('should return 404 if ticket not found', async () => {
//       const response = await request(gateway)
//         .patch('/it/ticket/cm374u1n70001lmwpny9wsty')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           description: 'Updated description',
//         });

//       expect(response.status).toBe(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("La taâche n'a pas etait trouver ");
//     });
//   });

//   afterAll(async () => {
//     // Déconnexion après les tests
//     await request(gateway)
//       .post(`/it/sign-out/${userId}`)
//       .set('Authorization', `Bearer ${token}`);
//   });
// });
