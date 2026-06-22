import Fastify from 'fastify'
import cors from '@fastify/cors'
import mongoose from 'mongoose'

const fastify = Fastify({ logger: true })

await fastify.register(cors, {
    origin: ['http://localhost:3000']
})

mongoose.connect('mongodb://localhost:27017/todoDB')
    .then(() => console.log('✅ MongoDB Local Connected'))
    .catch(err => console.log('❌ Mongo Error:', err))

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true }, // ← task maatti title
    completed: { type: Boolean, default: false }
})

const Todo = mongoose.model('Todo', todoSchema)

// GET all todos - direct array
fastify.get('/api/todos', async () => {
    const todos = await Todo.find()
    return todos
})

// POST new todo - direct object
fastify.post('/api/todos', async (request) => {
    const { title } = request.body
    const newTodo = new Todo({ title }) // ← title thanne use cheyyu
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

// DELETE todo
fastify.delete('/api/todos/:id', async (request) => {
    await Todo.findByIdAndDelete(request.params.id)
    return { message: 'Deleted' }
})

const PORT = 3001

fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.log(err)
        process.exit(1)
    }
    console.log(`🚀 Todo API running on port ${PORT}`)
})