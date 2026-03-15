# PulseChat 🚀

A modern **real-time chat application** built using **React, Node.js, Socket.io, and MongoDB**. PulseChat enables users to communicate instantly through rooms, private messages, and real-time updates with a sleek startup-style interface.

---

# ✨ Features

### Core Features

* Real-time messaging using WebSockets
* Multiple chat rooms
* User authentication (JWT)
* Message history stored in database
* Online/offline user status
* Responsive UI

### Advanced Features

* Typing indicators
* Read receipts
* Emoji reactions
* Image/file sharing
* Message edit/delete
* Infinite scroll for message history
* Dark mode support

---

# 🧠 Tech Stack

## Frontend

* React / Next.js
* Tailwind CSS
* Socket.io Client
* Axios
* Framer Motion

## Backend

* Node.js
* Express.js
* Socket.io

## Database

* MongoDB
* Mongoose

## Authentication

* JWT (JSON Web Token)
* bcrypt for password hashing

## Deployment

* Frontend → Vercel
* Backend → Render / Railway
* Database → MongoDB Atlas

---

# 🏗 System Architecture

```
Client (React)
     │
     │ WebSocket Connection
     ▼
Socket.io Server (Node.js)
     │
     ├── REST API (Express)
     │
     └── Redis Pub/Sub (optional scaling)
           │
           ▼
        MongoDB
```

---

# 📂 Project Structure

## Backend

```
server
 ├── controllers
 ├── models
 │    ├── User.js
 │    ├── Message.js
 │    └── Room.js
 ├── routes
 │    ├── authRoutes.js
 │    └── messageRoutes.js
 ├── socket
 │    └── socket.js
 ├── config
 │    └── db.js
 ├── middleware
 │    └── authMiddleware.js
 └── server.js
```

## Frontend

```
client
 ├── src
 │   ├── components
 │   │   ├── Sidebar
 │   │   ├── ChannelList
 │   │   ├── ChatWindow
 │   │   ├── MessageBubble
 │   │   └── MessageInput
 │   │
 │   ├── hooks
 │   │   ├── useSocket
 │   │   └── useAuth
 │   │
 │   ├── services
 │   │   ├── socket.js
 │   │   └── api.js
 │   │
 │   ├── pages
 │   │   ├── Login
 │   │   └── Chat
 │   │
 │   └── App.jsx
```

---

# 🔌 WebSocket Events

| Event           | Description      |
| --------------- | ---------------- |
| connect         | User connects    |
| disconnect      | User leaves      |
| join_room       | Join a chat room |
| leave_room      | Leave room       |
| send_message    | Send message     |
| receive_message | Receive message  |
| typing          | Typing indicator |
| stop_typing     | Stop typing      |

Example:

```javascript
socket.emit("send_message", {
  roomId,
  message,
  sender
})
```

---

# 🗄 Database Schema

## User

```
User
- _id
- username
- email
- password
- avatar
- createdAt
```

## Message

```
Message
- _id
- senderId
- roomId
- content
- type (text/image/file)
- createdAt
```

## Room

```
Room
- _id
- name
- members
- createdBy
- createdAt
```

---

# ⚡ Real-Time Message Flow

```
User sends message
        │
socket.emit("send_message")
        │
Server receives event
        │
Store message in MongoDB
        │
Broadcast to room
        │
Clients receive instantly
```

---

# 🎨 UI Layout

```
-------------------------------------------------
| Server List | Channels | Chat Window | Members |
-------------------------------------------------
|             |          |             |         |
|   icons     |  rooms   |  messages   | users   |
|             |          |             |         |
-------------------------------------------------
|              Message Input Box                 |
-------------------------------------------------
```

Inspired by **Discord / Slack UI design**.

---

# 🔐 Authentication Flow

```
User Login
     │
Server verifies credentials
     │
Return JWT Token
     │
Frontend stores token
     │
Token sent with API requests
     │
Backend verifies token
```

---

# 🚀 Installation

## 1. Clone Repository

```
git clone https://github.com/yourusername/pulsechat.git
cd pulsechat
```

---

## 2. Backend Setup

```
cd server
npm install
```

Create `.env`

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

Run server:

```
npm run dev
```

---

## 3. Frontend Setup

```
cd client
npm install
npm run dev
```

---

# 🌍 Deployment

Frontend

```
Vercel
```

Backend

```
Render / Railway
```

Database

```
MongoDB Atlas
```

---

# 📸 Screenshots

Add screenshots of:

* Chat UI
* Rooms sidebar
* Message interface
* Dark mode

Example:

```
/screenshots/chat-ui.png
/screenshots/rooms.png
```

---

# 📈 Future Improvements

* Video calling
* Voice channels
* Push notifications
* Message search
* AI chatbot assistant
* End-to-end encryption

---

# 🧪 Testing

Tools:

* Jest
* Supertest
* Cypress

---

# 🧑‍💻 Author

**Abhra**

College student passionate about **full-stack development and real-time systems**.

---

# ⭐ Support

If you like this project, consider giving it a **star ⭐ on GitHub**.

---

# 📜 License

MIT License
