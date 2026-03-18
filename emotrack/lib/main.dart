import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'theme.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/result_screen.dart';
import 'screens/history_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs   = await SharedPreferences.getInstance();
  final userId  = prefs.getInt('user_id');
  final isLoggedIn = userId != null;
  runApp(EmoTrackApp(isLoggedIn: isLoggedIn));
}

class EmoTrackApp extends StatelessWidget {
  final bool isLoggedIn;
  const EmoTrackApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EmoTrack',
      theme: appTheme(),
      debugShowCheckedModeBanner: false,
      initialRoute: '/splash',
      routes: {
        '/splash':   (_) => const SplashScreen(),
        '/login':    (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/home':     (_) => const HomeScreen(),
        '/history':  (_) => const HistoryScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/result') {
          return MaterialPageRoute(
            builder: (_) => ResultScreen(data: settings.arguments as Map<String, dynamic>),
          );
        }
        return null;
      },
    );
  }
}
