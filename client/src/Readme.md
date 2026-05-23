# Spark - Slack Clone

Spark is a real-time team communication and collaboration platform inspired by Slack.  
It enables users to chat individually, create groups, share files, react to messages, make audio/video calls, and collaborate efficiently in a modern interactive workspace.

---

# Features

## Authentication
- User Signup and Login
- Secure JWT Authentication
- Continue with Google using Firebase Authentication
- Protected Routes

---

## Real-Time Messaging
- One-to-One Messaging
- Real-Time Socket.IO Communication
- Instant Message Delivery
- Online/Offline Status

---

## Group & Channel Features
- Create Group Channels
- Join Team Conversations
- Group Messaging Support

---

## Message Features
- Emoji Reactions on Messages
- Edit Sent Messages
- Edited Timestamp Display
- Thread Replies
- WhatsApp/Slack Style Chat Layout
- Message Seen Status

---

## File Sharing & Preview
Users can send and preview multiple file types directly inside chat.

Supported Files:
- Images
- PDF Files
- DOC/DOCX Files
- ZIP Files
- URLs
- YouTube Video Links

Preview Features:
- PDF Preview
- URL Preview
- YouTube Video Preview
- File Download Support

---

## Audio & Video Calling
- Real-Time Audio Calls
- Real-Time Video Calls
- Call Duration Display

---

## Dashboard Features
- Total Connections Count
- Total Messages Count
- Member Since Information
- Personal Notes Section

---

# Tech Stack

## Frontend
- React.js
- Tailwind CSS
- React Router
- Zustand
- Socket.IO Client

---

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

---

## Authentication & Storage
- Firebase Google Authentication
- JWT Authentication
- Multer File Upload

---

# Project Structure

## Client

```bash
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ReactionPopup.jsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── ChatPage.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── socket.js
│   │   ├── firebase.js
│   │   └── ...
│   │
│   ├── store/
│   │   ├── useMessageStore.js
│   │   ├── useAuthStore.js
│   │   └── ...
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── vite.config.js
```

---

## Server

```bash
server/
├── APIs/
│   ├── UserAPI.js
│   ├── MessageAPI.js
│   ├── MessageFeatureAPI.js
│   └── ChannelAPI.js
│
├── controllers/
│   ├── message.js
│   ├── messageFeature.js
│   └── ...
│
├── middleware/
│   ├── verifyToken.js
│   ├── upload.js
│   └── ...
│
├── Models/
│   ├── UserModel.js
│   ├── MessageModel.js
│   ├── ChannelModel.js
│   └── ...
│
├── uploads/
│
├── node_modules/
│
├── server.js
├── package.json
└── .env
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd spark
```

---

# Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Backend Setup

```bash
cd server
npm install
npm start
```

Backend runs on:

```bash
http://localhost:4000
```

---

# Environment Variables

## Client

Create `.env` file inside client folder:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Server

Create `.env` file inside server folder:

```env
PORT=4000
MONGO_URL=your_mongodb_url
JWT_SECRET=your_secret
```

# Future Enhancements

- Message Search
- Screen Sharing
- Voice Notes
- Notifications
- Message Delete Feature
- Dark/Light Theme Toggle

# Contributors

- Jitesh Kumar
- Gudladona Greeshma
- Kachapuram Harshitha
- Uppala Anand Venkata Satyanarayana Murthy
- Burgu Shivamani Sai

---

# License

This project is developed for educational and learning purposes.