const request = require('supertest');

const app = require('express')();

describe('Task API', () => {
    // Successful POST /tasks test
    it('should create a task and return status code 200', async () => {
        const response = await request(app).post('/tasks').send({
            title: 'Task 1',
            priority: 'High',
            deadline: new Date().toISOString(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Test 1');
    });

    // Unsuccessful POST /tasks test
    it('should return status code 400', async () => {
        const response = await request(app).post('/tasks').send({
            title: 123,
            priority: 'Mid',
            deadline: '13 July 2025',
        });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('Invalid input.');
    });

    // GET /tasks test
    it('should get all tasks and return status code 200', async () => {
        const response = await request(app).get('/tasks');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});