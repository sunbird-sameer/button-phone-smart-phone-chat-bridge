---

# CloudFone & Button Phone - Smartphone Chat Bridge (V4)

This repository contains a chat application split into two parts using Google Firebase. It allows legacy physical-keypad devices operating on custom runtimes (like CloudFone) and modern smartphones (via a PWA) to communicate safely in the exact same chat room.

> 🎙️ **What's New in V4:** We have integrated an AI-powered **Speech-to-Text (STT)** system. Users can now record voice notes directly from their physical devices and automatically transcribe them into text messages using the Groq Cloud API.

---

## How It Works

1. **Project 1 (The Chat Database):** This Firebase project hosts the Realtime Database (`/chatroom/messages`). It stores all chat logs and manages message read/sent status states.
2. **Project 2 (The Security Guard):** This Firebase project handles user login. Only user accounts manually added to Project 2's Authentication dashboard can access the smartphone PWA.

* **The CloudFone / Button Phone App (`/chat-legacy/index.html`):** Runs directly on the CloudFone runtime environment. It uses low-power, lightweight scripts (`XHR`) to send/receive texts, auto-refreshes the room every 3 seconds, handles custom message-read receipts, and leverages native media recording hardware to convert speech into text using the Groq `whisper-large-v3-turbo` model.
* **The Smartphone PWA (`/chat-pwa/index.html`):** A modern public-facing app protected by a rigid authentication layer (Project 2). It streams real-time data from Project 1 and supports background push notifications.

---

### Security Concerns & Architecture Choices

When deploying this system, it is important to understand the security trade-offs between the two interfaces and how they interact with the database.

#### The CloudFone Deployment (Private URL Deployment)

* **The Challenge:** While CloudFone fully supports automatic message updates and advanced hardware recording APIs, handling manual user authentication (typing emails and complex passwords) on physical keypads is highly tedious and impractical for daily use.
* **The Architecture:** To keep the device operational and frictionless, the phone interface (`/chat-legacy/index.html`) is hosted on a completely hidden, private URL known **only** to the trusted device operator.
* **The Security Assumption:** Security for this section relies entirely on **obscurity**. Because the database rules allow read/write access via the Project 1 API Key/Secret, anyone who discovers this private link can read or write to the chat room. The URL must never be shared publicly.

---

## Project Setup Guide

### Step 1: Configure Project 1 (Database Rules)

1. Go to your **Firebase Console** and open **Project 1**.
2. Create a **Realtime Database** (choose the location closest to you, like `asia-southeast1`).
3. Go to the **Rules** tab in your Firebase Console database dashboard.
4. Open the file **`chat-legacy/firebase_rtdb_rules.json`** located in this repository on your local computer.
5. **Copy all the text** inside `chat-legacy/firebase_rtdb_rules.json`.
6. **Paste the copied text** directly into the Rules code editor in the Firebase Console (replacing any default rules).
7. Click **Publish**.

### Step 2: Configure Project 2 (Security Guard)

1. In the Firebase Console, open **Project 2**.
2. Go to **Build** -> **Authentication** and click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password** and turn on **Enable**. Click **Save**.
4. Go to the **Users** tab and click **Add user**. Manually type the specific emails and passwords you want to allow into your chat room.

---

## File Edits Needed

### 1. For the CloudFone App (`/chat-legacy/index.html`)

Open `/chat-legacy/index.html` and configure the database details along with your Groq API credentials near the top of the script block:

```javascript
// ================================================================
//  CONFIG
// ================================================================
var DB_URL      = "https://your-project-1-id-default-rtdb.firebaseio.com"; // Your Project 1 database URL (No trailing slash)
var API_KEY     = "YOUR_PROJECT_1_SECRET_OR_API_KEY";                     // Your Project 1 token
var groqApiKey  = "YOUR_GROQ_CLOUD_API_KEY_HERE";                         // Your Groq API key for Speech-to-Text
// ================================================================

```

### 2. For the Smartphone PWA (`/chat-pwa/index.html`)

Open `/chat-pwa/index.html` and fill out both config sections inside the script tag:

```javascript
// 1. PROJECT 2 CONFIG (Copy keys from Project 2 Web App setup)
const project2Config = {
  apiKey: "PASTE_YOUR_PROJECT_2_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_2_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_2_ID"
};

// 2. PROJECT 1 CONFIG (Must match the values inside your button phone file)
var DB_URL  = "https://your-project-1-id-default-rtdb.asia-southeast1.firebasedatabase.app";
var API_KEY = "YOUR_PROJECT_1_SECRET_OR_API_KEY";

```

---

## How to Host the HTML Files on Firebase

Both apps can be hosted completely for free using Firebase Hosting. Because they serve different purposes, you must deploy them to their respective Firebase projects.

### Step-by-Step Hosting Deployment

#### 1. Install the Firebase Tools & Log In

```bash
npm install -g firebase-tools
firebase login

```

#### 2. Deploying the CloudFone App (Project 1 - Private URL)

1. Navigate to the `chat-legacy` folder, and initialize firebase hosting:

```bash
cd chat-legacy
firebase init hosting

```

2. Follow the terminal prompts:

* Select **Use an existing project** and choose **Project 1**.
* Set your public directory to `.` (the current folder).
* Configure as a single-page app: **No**.

3. Deploy it live:

```bash
firebase deploy

```

4. **Save the generated hosting URL securely. This is your hidden, private web app link meant to be loaded directly onto the CloudFone system.**

#### 3. Deploying the Smartphone PWA App (Project 2 - Public URL)

1. Navigate to `chat-pwa` folder, and initialize firebase hosting:

```bash
cd ../chat-pwa
firebase init hosting

```

2. Follow the terminal prompts:

* Select **Use an existing project** and choose **Project 2**.
* Set your public directory to `.` (the current folder).
* Configure as a single-page app: **Yes**.

3. Deploy it live:

```bash
firebase deploy

```

---

## How to Use the CloudFone App (V4 Operations)

Because the interface is customized for physical layout interactions and enhanced features, please follow these operating instructions:

### 1. Voice Typing (Speech-To-Text)

* To dictate a message instead of typing on the physical keypad, click the green **`REC`** button.
* The button will toggle to a red **`STOP`** layout, indicating that the device's micro-hardware is actively listening.
* Speak clearly into the device. When finished, select and click the **`STOP`** button.
* The status tracker will display `Transcribing voice...` while sending the secure transaction payload to the Groq server. Within seconds, the generated transcription will automatically fill the text container, ready for validation or submission.

### 2. Automatic Message Updates & Status Indicators

* **Syncing:** You do **not** need to manually refresh the browser. The CloudFone application automatically polls for incoming room data every 3 seconds.
* **Read Statuses:** When sending text payloads, the software monitors internal synchronization stamps. Your own sent items will present an inline status marker:
* `[SENT]`: The message is recorded securely on the database cluster.
* `[SEEN]`: The smartphone participant has actively pulled and read your message string onto their interface screen.



### 3. Scrolling to the Bottom

* Because physical keypad operating software occasionally locks focus mechanisms, a **`v JUMP TO BOTTOM v`** routing link is placed at the absolute top layout of the viewport. Pressing it will instantly scroll down to show the latest active messaging history.
