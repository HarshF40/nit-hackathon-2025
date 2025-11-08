import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';

class ApiService {
  static String get baseUrl => EnvConfig.apiBaseUrl;

  static Future<Map<String, dynamic>> registerUser({
    required String name,
    required String aadharNumber,
    required String permanentAddress,
    required String dob,
    required String password,
    String? profilePicBase64,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/registerUser');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'aadharNumber': aadharNumber,
          'permanentAddress': permanentAddress,
          'dob': dob,
          'password': password,
          if (profilePicBase64 != null) 'profilePicBase64': profilePicBase64,
        }),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return {'success': true, 'data': responseData};
      } else {
        return {
          'success': false,
          'error': responseData['error'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }

  static Future<Map<String, dynamic>> loginUser({
    required String aadharNumber,
    required String password,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/loginUser');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'aadharNumber': aadharNumber, 'password': password}),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': responseData};
      } else {
        return {
          'success': false,
          'error': responseData['error'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }
}
