---

# CloudFone & Button Phone - Smartphone Chat Bridge

This repository contains a chat application split into two parts using Google Firebase. It allows legacy physical-keypad devices (like CloudFone) and modern smartphones (via a Progressive Web App or PWA) to chat together in the exact same room safely.

---

## How It Works

1. **Project 1 (The Chat Database):** This Firebase project hosts the Realtime Database (`/chatroom/messages`). It stores all the chat messages.
2. **Project 2 (The Security Guard):** This Firebase project handles user login. Only user accounts manually added to Project 2's Authentication dashboard can access the smartphone PWA.

* **The CloudFone / Button Phone App (`/chat-legacy/index.html`):** Runs directly on the CloudFone environment rather than a standard stock browser. It uses an optimized, low-power script with standard web requests (`XHR`) to send and receive data. It automatically fetches and updates new messages every 3 seconds.
* **The Smartphone PWA (`/chat-pwa/index.html`):** First asks the user to log in via Project 2. Once authorized, it reveals the chat screen and automatically checks Project 1 for new messages every 3 seconds. It can also send background push notifications when the browser window is closed.

---

### Security Concerns & Architecture Choices

When deploying this system, it is important to understand the security trade-offs between the two interfaces and how they interact with the database.

#### The CloudFone Deployment (Private URL Deployment)

* **The Challenge:** While CloudFone fully supports automatic message updates, handling manual user authentication (typing an email and password) on a physical keypad or specialized interface is highly tedious and impractical for daily use.
* **The Architecture:** To keep the device operational and frictionless, the phone interface (`/chat-legacy/index.html`) is hosted on a completely hidden, private URL known **only** to the trusted device operator.
* **The Security Assumption:** Security for this section relies entirely on **obscurity**. Because the database rules allow read/write access via the Project 1 API Key/Secret, anyone who discovers this private link can read or write to the chat room. The URL must never be shared publicly.

#### The Smartphone PWA (Public URL Deployment)

* **The Architecture:** The modern PWA interface (`/chat-pwa/index.html`) can safely be hosted on a public, open URL because it is protected by a mandatory login wall managed by Project 2.
* **The Security Assumption:** Modern smartphone browsers support secure session persistence. Once an authorized user logs in, Firebase safely keeps them authenticated in the background across tab closes and device reboots.
* **The Security Loop:** Even though the PWA's web address is public, unauthorized third parties cannot bypass the login prompt to access the underlying Project 1 chat data or intercept your messages.

#### Backend Isolation Summary

By separating your setup into two projects, you achieve the best of both worlds: your physical device keeps its simple, credential-free operational loop on a hidden URL, while your public-facing smartphone app maintains rigid, modern account protections to keep outsiders locked out.

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
5. Go to **Project Settings** (gear icon) -> **General**, scroll down to "Your apps", click the Web icon (`</>`), register your web app, and copy your config keys.

---

## File Edits Needed

### 1. For the CloudFone App (`/chat-legacy/index.html`)

Open `/chat-legacy/index.html` and change these variables near the bottom:

```javascript
var DB_URL  = "https://your-project-1-id-default-rtdb.firebaseio.com"; // Your Project 1 database URL (No trailing slash)
var API_KEY = "YOUR_PROJECT_1_SECRET_OR_API_KEY"; // Your Project 1 token

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
var DB_URL  = "https://your-project-1-id-default-rtdb.asia-southeast1.firebasedatabase.app"; // No trailing slash
var API_KEY = "YOUR_PROJECT_1_SECRET_OR_API_KEY";

```

---

## How to Host the HTML Files on Firebase

Both apps can be hosted completely for free using Firebase Hosting. Because they serve different purposes, you must deploy them to their respective Firebase projects.

### Important: Setup Two Separate Firebase Projects First

Before hosting, ensure you have created two completely separate projects in your Firebase Console:

1. **Project 1:** Dedicated to your Realtime Database and the CloudFone app.
2. **Project 2:** Dedicated to user Authentication and the Smartphone PWA app.

### Step-by-Step Hosting Deployment

Follow these steps on your computer terminal to host both platforms:

#### 1. Install the Firebase Tools & Log In

If you haven't already, install the Firebase Command Line Interface (CLI) and log into your Google account:

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

4. Copy the generated hosting URL. This is your public link that smartphone users can visit, install as an app, and log into securely.

---

## How to Use the CloudFone App

Because the app is optimized for CloudFone rather than a standard stock mobile browser, here is how to interact with the interface layout:

1. **Scrolling to the Bottom:** Since physical keypad interfaces often restrict automated script-driven scrolling window focuses, you can manually select and click the **`v JUMP TO BOTTOM v`** button located at the top of the screen to quickly snap down to the latest active messages.
2. **Automatic Message Updates:** You do **not** need to manually refresh the page or press any sync elements to look for new incoming texts. The CloudFone runtime environment permits active background polling intervals, allowing the app to seamlessly fetch and append new messages automatically every 3 seconds.
