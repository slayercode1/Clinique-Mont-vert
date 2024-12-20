// import request from 'supertest';
// import gateway from '../src/app';
// import { describe, expect, beforeAll, it, afterAll } from '@jest/globals';

// describe('API Endpoints Fleet', () => {
//   let token: string;
//   let userId: string;
//   let vehicleId: string;

//   beforeAll(async () => {
//     const loginResponse = await request(gateway).post('/it/sign-in').send({
//       email: 'support@technique.com',
//       password: 'Jx8QKYJ3Jqgz?sPn#n',
//     });

//     // Vérifie si la connexion a réussi et récupère le token
//     token = loginResponse.body.data?.token;
//     userId = loginResponse.body.data?.id;
//   });

//   describe('getVehicles', () => {
//     it('should return a list of vehicles', async () => {
//       const response = await request(gateway)
//         .get('/fleet/vehicles')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(Array.isArray(response.body.data)).toBe(true);
//     });
//   });

//   describe('createVehicle', () => {
//     it('should create a new vehicle', async () => {
//       const newVehicle = {
//         brand: 'Toyota',
//         state: 'IN_USE',
//         kilometres: '0',
//         model: 'Corolla',
//         year: 2024,
//         maintenance_date: new Date(),
//       };

//       const response = await request(gateway)
//         .post('/fleet/create-vehicle')
//         .set('Authorization', `Bearer ${token}`)
//         .send(newVehicle);

//       vehicleId = response.body.data?.id;
//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBe(response.body.data);
//     });
//   });

//   describe('createCost', () => {
//     it('should create a new cost for a specific vehicle', async () => {
//       const costData = {
//         vehicleId: vehicleId,
//         description: 'Oil change',
//         cost: '120',
//         maintenance_date: new Date(),
//       };

//       const response = await request(gateway)
//         .post('/fleet/create-cost')
//         .set('Authorization', `Bearer ${token}`)
//         .send(costData);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toMatchObject(response.body.data);
//     });
//   });

//   describe('getCost', () => {
//     it('should return a list of costs for a specific vehicle', async () => {
//       const response = await request(gateway)
//         .get(`/fleet/vehicle/${vehicleId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toEqual(expect.any(Array));
//     });

//     it('should return 404 if the vehicle is not found', async () => {
//       const response = await request(gateway)
//         .get(`/fleet/vehicle/${vehicleId}aaaaz`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toContain(
//         "Le véhicule n'a pas était trouver"
//       );
//     });
//   });

//   describe('updateVehicle', () => {
//     it('should update an existing vehicle', async () => {
//       const updatedData = { state: 'IN_REPAIR' };
//       const response = await request(gateway)
//         .patch(`/fleet/update-vehicle/${vehicleId}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send(updatedData);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.state).toBe('IN_REPAIR');
//     });

//     it('should return 404 if the vehicle does not exist', async () => {
//       const response = await request(gateway)
//         .patch(`/fleet/update-vehicle/${vehicleId}z`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({ state: 'IN_REPAIR' });

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toContain(
//         "Le véhicule n'a pas était trouver"
//       );
//     });
//   });

//   afterAll(async () => {
//     // Déconnexion après les tests
//     await request(gateway)
//       .post(`/it/sign-out/${userId}`)
//       .set('Authorization', `Bearer ${token}`);
//   });
// });
