# Emotrack 🧠

An AI-powered emotion tracking mobile app that analyses your journal entries and identifies your emotional state using a fine-tuned DistilBERT model.

---

## Try the App

Install **Expo Go** on your phone, then scan the QR code below:

**Android** → [Download Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)  
**iPhone** → [Download Expo Go](https://apps.apple.com/app/expo-go/id982107779)

> **To get the live QR code:** Ask the developer to run the app server and share the QR code with you via WhatsApp or email. You scan it directly in the Expo Go app.

---

## Features

- **Emotion Analysis** — Write a journal entry and get instant AI-powered emotion detection
- **7 Emotions** — Joy, Sadness, Anger, Fear, Disgust, Surprise, Neutral
- **Journal History** — Browse and delete past entries with timestamps
- **Emotion Trends** — Weekly mood strip, frequency chart, and distribution breakdown
- **Motivational Quotes** — Personalised quotes based on your detected emotion
- **User Accounts** — Register, login, edit profile, and delete account

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 54) |
| AI Model | DistilBERT fine-tuned on GoEmotions |
| API | FastAPI hosted on HuggingFace Spaces |
| Storage | AsyncStorage (local, per-user) |

---

## Project Structure

```
├── MobileApp/          # React Native Expo app
│   ├── App.js
│   ├── src/
│   │   ├── screens/    # Journal, History, Trends, Profile, Auth
│   │   ├── components/ # EmotionResult
│   │   ├── utils/      # api.js, auth.js, storage.js
│   │   └── constants/  # emotions.js, quotes.js
│   └── package.json
│
├── Model Code/         # DistilBERT training notebooks
│   ├── kaggle_notebook_ga.py    # GA hyperparameter search + training
│   ├── kaggle_notebook_final.py # Clean training notebook
│   └── push_to_hub.py           # Upload model to HuggingFace Hub
│
└── HuggingFace Space/  # FastAPI backend
    ├── app.py
    └── requirements.txt
```

---

## Run Locally

**Requirements:** Node.js, Expo Go on your phone

```bash
cd MobileApp
npm install --legacy-peer-deps
npx expo start --tunnel
```

Scan the QR code shown in your terminal with Expo Go.

---

## Model Training (Kaggle)

1. Open `Model Code/kaggle_notebook_ga.py` in a Kaggle notebook
2. Set accelerator to **GPU T4 x2**
3. Add `HF_TOKEN` secret in Kaggle secrets panel
4. Run all cells — GA searches hyperparameters, then does final training
5. Run `push_to_hub.py` to upload the model to HuggingFace Hub

---

## API

Live at: `https://melani7576-ekman-emotion-classifier.hf.space`

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/predict` | POST | Analyse emotion from text |

**Example:**
```bash
curl -X POST https://melani7576-ekman-emotion-classifier.hf.space/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I feel so happy today"}'
```
