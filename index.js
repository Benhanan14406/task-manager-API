const app = require('express')();
const PORT = 8080;
const {PrismaClient} = require('./generated/prisma');
const {z} = require('zod');
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