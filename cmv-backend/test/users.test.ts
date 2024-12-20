import request from 'supertest';
import gateway from '../src/app';
import { describe, expect, beforeAll, it, afterAll } from '@jest/globals';

describe('API Endpoints USER', () => {
  let token: string;
  let userId: string;

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

  it('GET /users should return list of users', async () => {
    const response = await request(gateway)
      .get('/it/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: response.body.data,
    });
  });

  it('GET /user/:id should return user details', async () => {
    const response = await request(gateway)
      .get(`/it/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', userId);
    expect(response.body.data).not.toHaveProperty('password'); // Vérifie que le mot de passe n'est pas exposé
  });

  it('GET /user/:id should return 404 for non-existing user', async () => {
    const response = await request(gateway)
      .get('/it/user/nonexistentId123')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty(
      'message',
      "L'utilisateur n'a pas était trouver"
    );
  });

  it('GET /roles should return a list of roles', async () => {
    const response = await request(gateway)
      .get('/it/roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0); // Vérifie qu'il y a au moins un rôle
  });

  it('POST /user should create an user', async () => {
    const response = await request(gateway)
      .post('/it/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'UserTest',
        lastname: 'UserTest',
        email: 'yannnnclain91@gmail.com',
        password: 'adminadmin19',
        status: 'ACTIF',
        roleId: 'cm3ychtom000010zcuo2edz4m',
        serviceId: 'cm4a11aq4001efiw8yb7k9314',
      })
      .expect(200)
      .expect('Content-Type', /json/);
    
    console.log('response.body', response.body);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toEqual({
      success: true,
      data: response.body.data,
    });
  });

  it('POST /role should create a new role', async () => {
    const response = await request(gateway)
      .post('/it/role')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'NewRoleTest',
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', 'NewRoleTest');
  });

  it('POST /service should create a new service', async () => {
    const response = await request(gateway)
      .post('/it/service')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'NewServiceTest',
        description: 'Service created for testing purposes',
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', 'NewServiceTest');
  });

  it('POST /permission should create or update a permission', async () => {
    const response = await request(gateway)
      .post('/it/permission')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'NewPermissionTest',
        actions: 'read'
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', 'NewPermissionTest');
    expect(response.body.data).toHaveProperty('actions');
    expect(Array.isArray(response.body.data.actions)).toBe(true);
  });

  it('PATCH /user/:id should update an user', async () => {
    const response = await request(gateway)
      .patch(`/it/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        lastname: 'Dev',
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toEqual({
      success: true,
      data: response.body.data,
    });
  });

  it('DELETE /delete-user/:id should delete the user', async () => {
    const userToDelete = await request(gateway)
      .post('/it/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'TempUser',
        lastname: 'ToDelete',
        email: 'tempuserdelete@example.com',
        password: 'tempPassword123',
        status: 'ACTIF',
        roleId: 'cm3ychtom000010zcuo2edz4m',
        serviceId: 'cm4a11aq4001efiw8yb7k9314',
      })
      .then((res) => res.body.data);
    
    console.log('userToDelete', userToDelete);

    const deleteResponse = await request(gateway)
      .delete(`/it/delete-user/${userToDelete?.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(deleteResponse.body).toHaveProperty('success', true);

    // Vérifie que l'utilisateur supprimé ne peut plus être récupéré
    const getDeletedUser = await request(gateway)
      .get(`/it/user/${userToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(getDeletedUser.body).toHaveProperty('success', false);
  });

  afterAll(async () => {
    // Déconnexion après le test
    await request(gateway)
      .post(`/it/sign-out/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  });
});
