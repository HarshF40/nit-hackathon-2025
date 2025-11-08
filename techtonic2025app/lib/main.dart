import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:techtonic2025app/pages/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: const SplashScreen(),
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF1261A0),
        scaffoldBackgroundColor: const Color(0xFFF5F9FC),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1261A0),
          primary: const Color(0xFF1261A0),
          secondary: const Color(0xFF3895D3),
        ),
        useMaterial3: true,
      ),
    );
  }
}
