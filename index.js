import Fastify from 'fastify'
import cors from '@fastify/cors'
import mongoose from 'mongoose'

const fastify = Fastify({ logger: true })

await fastify.register(cors, {
    origin: true
})

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/todoDB"

try {
    await mongoose.connect(mongoUrl)
    console.log('✅ MongoDB Connected')
} catch (err) {
    console.log('❌ Mongo Error:', err)
    process.exit(1)
}

// Schema
const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true })

const Todo = mongoose.model('Todo', todoSchema)

// Health check route
fastify.get('/', async () => {
    return {
        message: 'Task Tracker API is Live 🚀',
        status: 'ok',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
})

// GET all todos
fastify.get('/api/todos', async (request, reply) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 })
        return todos
    } catch (err) {
        reply.code(500).send({ error: 'Failed to fetch todos' })
    }
})

// POST new todo
fastify.post('/api/todos', async (request, reply) => {
    try {
        const { title } = request.body
        if (!title) {
            return reply.code(400).send({ error: 'Title is required' })
        }
        const newTodo = new Todo({ title })
        await newTodo.save()
        reply.code(201).send(newTodo)
    } catch (err) {
        reply.code(500).send({ error: 'Failed to create todo' })
    }
})

// PUT - Update todo
fastify.put('/api/todos/:id', async (request, reply) => {
    try {
        const { id } = request.params
        const { title, completed } = request.body

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { title, completed },
            { new: true, runValidators: true }
        )

        if (!updatedTodo) {
            return reply.code(404).send({ error: 'Todo not found' })
        }
        return updatedTodo
    } catch (err) {
        reply.code(500).send({ error: 'Failed to update todo' })
    }
})

// DELETE todo
fastify.delete('/api/todos/:id', async (request, reply) => {
    try {
        const { id } = request.params
        const deletedTodo = await Todo.findByIdAndDelete(id)

        if (!deletedTodo) {
            return reply.code(404).send({ error: 'Todo not found' })
        }
        return { message: 'Todo deleted successfully' }
    } catch (err) {
        reply.code(500).send({ error: 'Failed to delete todo' })
    }
})

// Render port + host
const PORT = process.env.PORT || 3001
const HOST = '0.0.0.0'

try {
    await fastify.listen({ port: PORT, host: HOST })
    console.log(`🚀 Todo API running on port ${PORT}`)
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}