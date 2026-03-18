# EmoTrack — Mental Health Emotion Detection App

**Author:** Ejirika Perfect Gift | Trinity University, Yaba, Lagos  
**Project:** Context-Aware Mental Health Prediction & Intervention System  
**Stack:** Flutter (frontend) + Flask (backend) + DistilBERT (ML model)

---

## 📱 Screens

| Screen | Description |
|---|---|
| Splash | App logo, auto-navigates to login or home |
| Login | Email + password sign in |
| Register | Create new account |
| Home | Text input + emotion analysis + recent entries |
| Result | Detected emotion + confidence + all scores + wellness tip |
| History | Full mood journal + emotion frequency bar chart |

---

## 🚀 How to Run

### Prerequisites
- Flutter SDK installed (https://flutter.dev/docs/get-started/install)
- Android Studio or VS Code with Flutter extension
- Android emulator or physical device

### Steps
```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/emotrack.git
cd emotrack

# 2. Install dependencies
flutter pub get

# 3. Set your backend URL
# Open lib/theme.dart and change:
# const kApiBase = 'https://mental-health-emotion-api.onrender.com';
# to your actual Render.com URL

# 4. Run the app
flutter run
```

---

## 🔌 Backend

The app connects to a Flask backend API that runs the DistilBERT emotion model.

Backend repo: https://github.com/YOUR_USERNAME/mental-health-api

### API Endpoints used by the app
| Endpoint | Used in |
|---|---|
| POST /register | Register screen |
| POST /login | Login screen |
| POST /predict | Home screen — analyse button |
| GET /history/:id | History screen + recent entries |
| GET /stats/:id | History screen chart |

---

## 🎨 Design

- Colour: Deep navy blue (#1A3A5C) + white + ice blue accents
- Style: Soft, calming, rounded cards
- Font: Roboto

---

## 📚 Academic Context

This app is the frontend component of a final year BSc Computer Science project.

The backend uses a DistilBERT model fine-tuned on the GoEmotions dataset (Demszky et al., 2020), 
consolidated to Ekman's 7 basic emotion classes (Labib et al., 2025), achieving 70% accuracy 
on the test set — an 11 percentage point improvement over the best classical ML baseline (LR: 59%).
