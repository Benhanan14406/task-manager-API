const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const { z } = require('zod');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

describe('Task API', () => {
    // beforeAll(async () => {
    //     await prisma.task.deleteMany(); // Clean DB
    // });
    //
    // afterAll(async () => {
    //     await prisma.$disconnect();
    // });

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

    it('should get all tasks and return status code 200', async () => {
        const response = await request(app).get('/tasks');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return status code 400', async () => {
        const response = await request(app).post('/tasks').send({
            title: '',
            priority: 'Medium',
            deadline: '13 July 2025',
        });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('Invalid input.');
    });
});