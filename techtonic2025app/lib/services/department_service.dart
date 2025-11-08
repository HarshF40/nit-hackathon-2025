import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';

class DepartmentService {
  static String get baseUrl => EnvConfig.apiBaseUrl;

  static Future<List<Map<String, dynamic>>> getAllDepartments() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/fetch/getAllDepartments'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['departments']);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Failed to fetch departments');
      }
    } catch (e) {
      throw Exception('Failed to fetch departments: $e');
    }
  }
}
