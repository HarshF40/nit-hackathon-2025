import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/user_preferences.dart';
import '../config/env_config.dart';

class PostService {
  static String get baseUrl => EnvConfig.apiBaseUrl;

  static Future<List<Map<String, dynamic>>> getPosts() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/getPosts'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['posts']);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Failed to fetch posts');
      }
    } catch (e) {
      throw Exception('Failed to fetch posts: $e');
    }
  }

  static Future<Map<String, dynamic>> createPost({
    required String description,
    required Map<String, double> location,
    String? imageBase64,
  }) async {
    try {
      // Get aadhar number from preferences
      final aadharNumber = await UserPreferences.getAadharNumber();
      if (aadharNumber == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/createPost'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'description': description,
          'location': location,
          'imageBase64': imageBase64,
          'aadharNumber': aadharNumber,
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Failed to create post');
      }
    } catch (e) {
      throw Exception('Failed to create post: $e');
    }
  }

  static Future<bool> updateVote({
    required String postId,
    required String type, // 'upvote' or 'downvote'
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/updateVote'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'postId': postId, 'type': type}),
      );
      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  static Future<List<Map<String, dynamic>>> getComments(String postId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/getComments'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'postId': postId}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['comments']);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Failed to fetch comments');
      }
    } catch (e) {
      throw Exception('Failed to fetch comments: $e');
    }
  }

  static Future<bool> createComment({
    required String comment,
    required String postId,
    required String authorAadhar,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/createComment'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'comment': comment,
          'postId': postId,
          'authorAadhar': authorAadhar,
        }),
      );
      return response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> likeComment(String commentId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/likeComment'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'commentId': commentId}),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
