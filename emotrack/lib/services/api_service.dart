import 'dart:convert';
import 'package:http/http.dart' as http;
import '../theme.dart';

class ApiService {
  static const _base = kApiBase;

  // ── Auth ──────────────────────────────────────────────────
  static Future<Map<String, dynamic>> register(String email, String password) async {
    final res = await http.post(
      Uri.parse('$_base/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 30));
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$_base/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 30));
    return jsonDecode(res.body);
  }

  // ── Predict ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> predict(String text, int? userId) async {
    final body = {'text': text};
    if (userId != null) body['user_id'] = userId.toString();

    final res = await http.post(
      Uri.parse('$_base/predict'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 60));
    return jsonDecode(res.body);
  }

  // ── History ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> history(int userId) async {
    final res = await http.get(
      Uri.parse('$_base/history/$userId'),
    ).timeout(const Duration(seconds: 30));
    return jsonDecode(res.body);
  }

  // ── Stats ─────────────────────────────────────────────────
  static Future<Map<String, dynamic>> stats(int userId) async {
    final res = await http.get(
      Uri.parse('$_base/stats/$userId'),
    ).timeout(const Duration(seconds: 30));
    return jsonDecode(res.body);
  }

  // ── Health check ──────────────────────────────────────────
  static Future<bool> isOnline() async {
    try {
      final res = await http.get(
        Uri.parse('$_base/health'),
      ).timeout(const Duration(seconds: 10));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
