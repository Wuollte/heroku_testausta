require('dotenv').config()
const express = require('express')
const app= express()
const Person = require('./models/person')
var morgan = require('morgan')
const cors = require('cors')
app.use(express.json())
app.use(cors())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :req[content-length] - :response-time ms :body '))
app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then (persons => {
    response.json(persons)
  })
})

app.get('/info',(request, response) => {
  const date=new Date()
  Person.count({}, function(err, count){
    response.send('<p1>Phonebook has info for '+count+' people <br><br>'+date+ '</p1>')
  })
})

app.get('/api/persons/:id',(request,response,next) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.post('/api/persons',(request,response,next) => {
  const body=request.body
  if(!body.number && !body.name) {
    return(response.status(400).json({ error:'name and number are missing' }))
  }
  if(!body.name) {
    return(response.status(400).json({ error :'name is missing' }))
  }
  if(!body.number) {
    return(response.status(400).json({ error :'number is missing' }))
  }
  const person = new Person({
    name:body.name,
    number:body.number
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response,next) => {
  console.log(request.params.id)
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request,response,next) => {
  const body=request.body
  const person = {
    name : body.name,
    number : body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError'){
    return response.status(400).send({ error:error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log('server is running on '+PORT)
})