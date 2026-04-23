---
title: Ekman Emotion Classifier
emoji: 🧠
colorFrom: purple
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Ekman Emotion Classifier API

FastAPI backend for the MindCheck mental health mobile app.
Classifies short text reflections into 7 Ekman emotion categories.

## Emotions
`joy` · `sadness` · `anger` · `fear` · `disgust` · `surprise` · `neutral`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/predict` | Classify emotion |

### POST /predict
```json
{ "text": "I feel really hopeful about tomorrow" }
```
Response:
```json
{
  "emotion": "joy",
  "label_id": 0,
  "confidence": 0.94,
  "all_scores": { "joy": 0.94, "sadness": 0.01, ... }
}
```

## Setup Instructions

### Step 1 — Push trained model from Kaggle to HF Hub
After training completes on Kaggle, run the `push_to_hub.py` script
in the **Model Code** folder. This uploads your fine-tuned model to
`YOUR_HF_USERNAME/ekman-emotion-model`.

### Step 2 — Create this Space
1. Go to huggingface.co/new-space
2. Name it `ekman-emotion-classifier`
3. SDK → **Docker**
4. Upload all files from this folder

### Step 3 — Set the MODEL_REPO secret
In the Space settings → **Secrets**, add:
- Key: `MODEL_REPO`
- Value: `YOUR_HF_USERNAME/ekman-emotion-model`

### Step 4 — Update the mobile app
In `MobileApp/src/utils/api.js`, replace the placeholder URL with:
`https://YOUR_HF_USERNAME-ekman-emotion-classifier.hf.space`
