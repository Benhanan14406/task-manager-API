const app = require('./index');
const {it} = require("zod/v4/locales");
const {request} = require("express");

describe('POST /tasks', () => {
    it('should return status code 200',  async () => {
        const res = await request(app).post('/tasks').send({
            title:'Task 1',
            description: 'Task Number 1',
            category: 'Task',
            priority: ['Low', 'Medium', 'High'].at(0),
            deadline: '2025-07-13T00:00:00.000Z',
        });
        expect(res.statusCode).toBe(200);
    })
})

describe('GET /tasks', () => {
    it('should return status code 200',  async () => {
        const res = await request(app).get('/tasks').send();
        expect(res.statusCode).toBe(200);
    })
})

describe('GET /tasks/:id', () => {
    it('should return status code 200',  async () => {
        const res = await request(app).get('/tasks/:').send();
        expect(res.statusCode).toBe(200);
    })
})

describe('PUT /tasks/:id', () => {
    it('should return status code 200',  async () => {
        const res = await request(app).put('/tasks/:').send();
        expect(res.statusCode).toBe(200);
    })
})

describe('DELETE /tasks/:id', () => {
    it('should return status code 204',  async () => {
        const res = await request(app).delete('/tasks/:').send();
        expect(res.statusCode).toBe(204);
    })
})