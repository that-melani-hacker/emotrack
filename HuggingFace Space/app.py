"""
Ekman Emotion Classifier — FastAPI backend for HuggingFace Spaces
Loads fine-tuned DistilBERT from HF Hub and serves predictions via REST API.
"""

import os
import re
import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ── Config ───────────────────────────────────────────────────────────────────
# Set these in HF Space → Settings → Variables and secrets
MODEL_REPO = os.getenv("MODEL_REPO", "Melani7576/ekman-emotion-model")
HF_TOKEN   = os.getenv("HF_TOKEN")    # needed if the model repo is private
MAX_LEN      = 128
EKMAN_LABELS = ["joy", "sadness", "anger", "fear", "disgust", "surprise", "neutral"]
DEVICE       = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ekman Emotion Classifier API",
    description="Classifies short text reflections into 7 Ekman emotions.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model once at startup ────────────────────────────────────────────────
print(f"Loading model: {MODEL_REPO}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_REPO, token=HF_TOKEN)
model     = AutoModelForSequenceClassification.from_pretrained(MODEL_REPO, token=HF_TOKEN)
model.to(DEVICE)
model.eval()
print(f"Model ready on {DEVICE}")

# ── Text cleaning (mirrors training preprocessing) ────────────────────────────
_EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)

def clean_text(text: str) -> str:
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = _EMOJI_RE.sub("", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s.,!?'\"-]", "", text)
    return re.sub(r"\s+", " ", text).strip() or "[empty]"

# ── Request / Response schemas ────────────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    emotion: str
    label_id: int
    confidence: float
    all_scores: dict

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "name":    "Ekman Emotion Classifier",
        "version": "1.0.0",
        "labels":  EKMAN_LABELS,
        "device":  str(DEVICE),
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty.")

    cleaned = clean_text(req.text)

    enc = tokenizer(
        cleaned,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=MAX_LEN,
    )
    input_ids      = enc["input_ids"].to(DEVICE)
    attention_mask = enc["attention_mask"].to(DEVICE)

    with torch.no_grad():
        logits = model(input_ids=input_ids, attention_mask=attention_mask).logits

    probs    = F.softmax(logits, dim=1).squeeze().cpu().numpy()
    label_id = int(probs.argmax())

    return PredictResponse(
        emotion=EKMAN_LABELS[label_id],
        label_id=label_id,
        confidence=round(float(probs[label_id]), 4),
        all_scores={lbl: round(float(probs[i]), 4) for i, lbl in enumerate(EKMAN_LABELS)},
    )
