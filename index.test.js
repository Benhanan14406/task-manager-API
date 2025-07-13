const request = require('supertest');
const {PrismaClient} = require('./generated/prisma');
const {z} = require('zod');
const prisma = new PrismaClient();

const app = require('express')();
app.use(require('express').json());

// Vallidation
const taskData = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High']),
    deadline: z.string().datetime(),
});

// Create a new task
app.post('/tasks', async (req, res) => {
    try {
        const data = taskData.parse(req.body);
        const task = await prisma.task.create({data});
        res.json(task);
    } catch {
        res.status(400).json({error: 'Invalid input.'});
    }
});

// Retrieve all tasks with filtering options
app.get('/tasks', async (req, res) => {
    const {category, priority, deadlineFrom, deadlineTo, sortBy = 'createdAt', sortOrder = 'asc'} = req.query;

    // Filtering
    const where = {
        ...(category && {category}),
        ...(priority && {priority}),
        ...(deadlineFrom || deadlineTo) && {
            deadline: {
                ...(deadlineFrom && {gte: new Date(deadlineFrom)}),
                ...(deadlineTo && {lte: new Date(deadlineTo)}),
            },
        },
    };

    try {
        // Find by filter
        const tasks = await prisma.task.findMany({
            where, orderBy: {
                [sortBy]: sortOrder,
            },
        });

        res.json(tasks);
    } catch {
        return res.status(404).json({error: 'Task does not exist.'});
    }
});

// Retrieve details of a specific task
app.get('/tasks/:id', async (req, res) => {
    try {
        const task = await prisma.task.findUnique({where: {id: Number(req.params.id)}});
        res.json(task);
    } catch {
        return res.status(404).json({error: 'Task does not exist.'});
    }
});

// Update details of an existing task
app.put('/tasks/:id', async (req, res) => {
    try {
        const data = taskData.parse(req.body);
        const task = await prisma.task.update({where: {id: Number(req.params.id)}, data});
        res.json(task);
    } catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({error: 'Task does not exist.'});
        } else {
            res.status(400).json({error: 'Invalid input.'});
        }
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        await prisma.task.delete({where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch {
        res.status(404).json({error: 'Task does not exist.'});
    }
});

describe('Unit test', () => {
    // Successful POST /tasks test
    it('should create a task and return status code 200', async () => {
        const response = await request(app).post('/tasks').send({
            title: 'Task 1',
            priority: 'High',
            deadline: new Date().toString() + new Date().getTime().toString(),
        });

        expect(response.statusCode).toBe(200);
    });

    // Unsuccessful POST /tasks test
    it('should return status code 400', async () => {
        const response = await request(app).post('/tasks').send({
            title: 123,
            priority: 'Mid',
            deadline: '13 July 2025',
        });

        expect(response.statusCode).toBe(400);
    });

    // GET /tasks test
    it('should get all tasks and return status code 200', async () => {
        const response = await request(app).get('/tasks');
        expect(response.statusCode).toBe(200);
    });
});