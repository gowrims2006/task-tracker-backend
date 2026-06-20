import Fastify from 'fastify'
import mongoose from 'mongoose'
import cors from '@fastify/cors'

const fastify = Fastify({ logger: true })
await fastify.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000']
})

// MongoDB Connect
mongoose.connect('mongodb://localhost:27017/todoDB')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ Mongo Error:', err))

const todoSchema = new mongoose.Schema({
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

const Todo = mongoose.model('Todo', todoSchema)


fastify.get('/api/todos', async (request, reply) => {
    const todos = await Todo.find()
    return { success: true, data: todos }
})

// POST new todo
fastify.post('/api/todos', async (request, reply) => {
    try {
        const newTodo = new Todo(request.body)
        await newTodo.save()
        reply.code(201).send({ success: true, data: newTodo })
    } catch (error) {
        reply.code(400).send({ success: false, message: error.message })
    }
})

// PUT update todo
fastify.put('/api/todos/:id', async (request, reply) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(request.params.id, request.body, { new: true })
        if (!updatedTodo) return reply.code(404).send({ success: false, message: 'Todo not found' })
        return { success: true, data: updatedTodo }
    } catch (error) {
        reply.code(400).send({ success: false, message: error.message })
    }
})

// DELETE todo
fastify.delete('/api/todos/:id', async (request, reply) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(request.params.id)
        if (!deletedTodo) return reply.code(404).send({ success: false, message: 'Todo not found' })
        return { success: true, message: 'Todo deleted successfully' }
    } catch (error) {
        reply.code(400).send({ success: false, message: error.message })
    }
})

// Start server
const PORT = process.env.PORT || 10000
fastify.listen({ 
  port: PORT, 
  host: '0.0.0.0' 
}, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Todo API running on port ${PORT}`)
})
