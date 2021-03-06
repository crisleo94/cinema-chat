require('dotenv').config()
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users')

const PORT = process.env.PORT
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const botName = 'CinemaChat Bot'

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

io.on('connection', (socket) => {

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)
  
    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to CinemaChat!!'))
  
    // User connected
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat.`))

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })
  
  // User disconnected
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    
    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`))

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }

  })
})

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})