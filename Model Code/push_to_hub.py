"""
push_to_hub.py  — Run this as the LAST cell in your Kaggle notebook
====================================================================
Uploads the fine-tuned model + tokenizer to your HuggingFace Hub repo
so the HF Space API can load it.

Steps:
  1. Add your HF write token as a Kaggle Secret named HF_TOKEN
     (Kaggle → Add-ons → Secrets)
  2. Set YOUR_HF_USERNAME below
  3. Run this cell after training is complete
"""

from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# ── CHANGE THESE ──────────────────────────────────────────────────────────────
HF_USERNAME = "YOUR_HF_USERNAME"           # e.g. "melani123"
REPO_NAME   = "ekman-emotion-model"        # will be created automatically
MODEL_DIR   = "/kaggle/working/ekman_emotion_model"
# ─────────────────────────────────────────────────────────────────────────────

from huggingface_hub import login
from kaggle_secrets import UserSecretsClient

# Kaggle secrets use their own client — NOT os.environ
user_secrets = UserSecretsClient()
hf_token = user_secrets.get_secret("HF_TOKEN")

login(token=hf_token)

repo_id = f"{HF_USERNAME}/{REPO_NAME}"
print(f"Pushing to: {repo_id}")

tokenizer = DistilBertTokenizer.from_pretrained(MODEL_DIR)
model     = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)

tokenizer.push_to_hub(repo_id)
model.push_to_hub(repo_id)

print(f"\nDone! Model live at: https://huggingface.co/{repo_id}")
print(f"\nNext: set MODEL_REPO={repo_id} in your HF Space Secrets.")
