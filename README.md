# Adam Chatbot

<!-- ![Chatbot Banner](./image.png) -->

## 🚀 Overview

This is a modern, AI-powered chatbot designed for websites.
It helps visitors connect instantly, captures leads (name + email), and provides intelligent answers through an **n8n backend workflow** powered by AI.

The chatbot can be easily installed and run locally for testing, or deployed on your own website.

---

## ✨ Features

* 💬 Sleek, modern chat interface
* 🧑‍💻 User onboarding (name + email capture)
* 🤖 AI-powered responses via **n8n + OpenAI**
* 💾 Chat history stored in browser session
* 📱 Fully responsive design (works on desktop & mobile)
* 🔧 Extendable UI with custom options (chat resizing, extra screens, meeting booking, etc.)

---

## 🛠️ Technologies

* **Frontend:** React.js, TypeScript, Bootstrap, Framer Motion
* **Backend (No-Code):** n8n workflows
* **AI Integration:** OpenAI API (via n8n HTTP requests)
* **Storage:** Browser sessionStorage

---

## 📦 Installation (Local Setup)

Follow these steps to run the chatbot locally:

### 1. Clone the Repository

```bash
git clone https://github.com/alihassanml/Adam-Chatbot.git
cd Adam-Chatbot
```

### 2. Install Dependencies

Make sure you have **Node.js (v16 or above)** installed.
Then run:

```bash
npm install
```

### 3. Configure Backend (n8n)

* Set up an **n8n instance** (local or cloud).
* Create a workflow with an **HTTP Webhook** to receive chat messages.
* Connect the workflow to the **OpenAI API** (or any AI API of your choice).
* Update the frontend code with your n8n webhook URL inside `fetch(...)` calls.

Example (inside the chatbot code):

```ts
const res = await fetch("https://your-n8n-instance/webhook/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_ID: userId, message: userMessage })
});
```

### 4. Start Development Server

```bash
npm run dev
```

Now open your browser at:

```
http://localhost:3000
```

Your chatbot will be running locally 🎉

---

## 📸 Screenshots

* **Intro Screen:** Welcomes the user and offers quick help
* **Form Screen:** Collects name and email before chatting
* **Chat Screen:** Real-time AI conversation
* **Book Meeting:** Optional integration with Calendly

![Chat Example](https://chat.robogrowthpartners.online/)

---

## 🌐 Deployment

Once tested locally, you can deploy the chatbot on:

* **Vercel / Netlify** (recommended for React apps)
* **Your own server**
* **Embedded on any website** (via iframe or React integration)

---

## 📝 License

MIT License – free to use, modify, and distribute.

---

## 📬 Support

For questions or setup help, please contact the development team.
