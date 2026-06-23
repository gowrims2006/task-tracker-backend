import Fastify from 'fastify'
import cors from '@fastify/cors'
import mongoose from 'mongoose'

const fastify = Fastify({ logger: true })

// CORS - Vercel link kittumbol ithu maattanam
import cors from '@fastify/cors'

await fastify.register(cors, {    
    origin: true  // ← ITHU MATHRAM. Ellam allow cheyyum
})

// ✅ MONGODB ATLAS USE CHEYYUKA
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/todoDB"

mongoose.connect(mongoUrl)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ Mongo Error:', err))

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
})

const Todo = mongoose.model('Todo', todoSchema)
// GET all todos nte mukalil iduka
fastify.get('/', async () => {
    return { message: 'Task Tracker API is Live 🚀' }
})
// GET all todos
fastify.get('/api/todos', async () => {
    const todos = await Todo.find()
    return todos
})

// POST new todo
fastify.post('/api/todos', async (request) => {
    const { title } = request.body
    const newTodo = new Todo({ title })
    await newTodo.save()
    return newTodo
})

// PUT - Update todo
fastify.put('/api/todos/:id', async (request) => {
    const { id } = request.params
    const { completed } = request.body
    const updatedTodo = await Todo.findByIdAndUpdate(id, { completed }, { new: true })
    return updatedTodo
})

// DELETE todo - ORU THAVANA MATHRAM
fastify.delete('/api/todos/:id', async (request) => {
    await Todo.findByIdAndDelete(request.params.id)
    return { message: 'Deleted' }
})

// ✅ RENDER NTE PORT + HOST USE CHEYYUKA - ORU THAVANA MATHRAM
const PORT = process.env.PORT || 3001

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
