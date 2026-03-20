import 'package:flutter/material.dart';

// ── Colours ─────────────────────────────────────────────────
const kNavy       = Color(0xFF1A3A5C);
const kNavyLight  = Color(0xFF2A5A8C);
const kBlueGrey   = Color(0xFF7AA3C8);
const kIceBg      = Color(0xFFF7F9FC);
const kIceCard    = Color(0xFFEEF4FA);
const kBorder     = Color(0xFFD4E3F0);
const kTextMain   = Color(0xFF1A3A5C);
const kTextMuted  = Color(0xFF5A7FA0);
const kTextHint   = Color(0xFF9AB8D0);

// ── API ──────────────────────────────────────────────────────
// TODO: Replace with your Render.com URL after deploying backendconst kApiBase    = 'https://mental-health-emotion-api.onrender.com';
const kApiBase = 'https://Melani7576-mental-health-api.hf.space';
// ── Emotion data ─────────────────────────────────────────────
const kEmojis = {
  'anger':   '😡',
  'disgust': '🤢',
  'fear':    '😨',
  'joy':     '😊',
  'sadness': '😢',
  'surprise':'😲',
  'neutral': '😐',
};

const kStressColors = {
  'High':     Color(0xFFFDE8E8),
  'Moderate': Color(0xFFFAEEDA),
  'Low':      Color(0xFFEAF3DE),
};

const kStressTextColors = {
  'High':     Color(0xFFA32D2D),
  'Moderate': Color(0xFF854F0B),
  'Low':      Color(0xFF3B6D11),
};

// ── Theme ────────────────────────────────────────────────────
ThemeData appTheme() {
  return ThemeData(
    useMaterial3: true,
    fontFamily: 'Roboto',
    scaffoldBackgroundColor: kIceBg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: kNavy,
      primary: kNavy,
      surface: kIceBg,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: kNavy,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Color(0xFFE8F0F8),
        fontSize: 18,
        fontWeight: FontWeight.w500,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: kNavy,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        minimumSize: const Size(double.infinity, 48),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: kNavy,
        side: const BorderSide(color: kNavy, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        minimumSize: const Size(double.infinity, 44),
        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: kIceCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kNavy, width: 1.5),
      ),
      hintStyle: const TextStyle(color: kTextHint, fontSize: 13),
      labelStyle: const TextStyle(color: kTextMuted, fontSize: 12),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    ),
  );
}
