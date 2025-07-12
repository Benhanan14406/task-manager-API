const app = require('express')();
const PORT = 8080;
const { PrismaClient } = require('./generated/prisma');
const { z } = require('zod');
const prisma = new PrismaClient();

app.use(require('express').json());
app.listen(PORT, () => console.log(`Alive on localhost:${PORT}`));

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
    } catch (err) {
        res.status(400).json({error: 'Invalid input.'});
    }
});

