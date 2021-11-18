const express = require('express')
const app= express()
var morgan = require('morgan')
const cors = require('cors')

let numbers =[
    {id:1, name: "Arto Hellas",number :"040-123456"},
    {id:2, name: "Ada Lovelace", number:"39-44-5323523"},
    {id:3, name:"Dan Abramov",number:"12-43-234345"},
    {id:4, name:"Mary Poppendick",number:"39-23-6423122"}
]

app.use(express.json())
app.use(cors())
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :req[content-length] - :response-time ms :body '))

app.get('/api/persons', (request,response)=>{
    response.json(numbers)
})

app.get('/info',(request,response)=>{
    const date=new Date();
    response.send("<p1>Phonebook has info for "+numbers.length+ " people <br><br>"+date+ "</p1>")
})

app.get('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    const person = numbers.find(person =>person.id === id)
    if (person){
        response.json(person)
    }
    else{
        response.status(404).end()
    }
})
const generateId = () => {
    const maxId = numbers.length > 0
      ? Math.max(...numbers.map(n => n.id))
      : 0
    return maxId + 1
}
app.post('/api/persons',(request,response)=>{
    const body=request.body
    if(!body.number && !body.name) {
        return(response.status(400).json({error:'name and number are missing'}))
    }
    if(!body.name) {
        return(response.status(400).json({error :'name is missing'}))
    }
    if(!body.number) {
        return(response.status(400).json({error :'number is missing'}))
    }

    if (numbers.find(person=>person.name === body.name)){
        return(response.status(400).json({error :'name must be unique'}))
    }
    const person =[{
        id:generateId(),
        name:body.name,
        number:body.number
    }]
    numbers = numbers.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    numbers =numbers.filter(person =>person.id !==id)
    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log('server is running on '+PORT)
})