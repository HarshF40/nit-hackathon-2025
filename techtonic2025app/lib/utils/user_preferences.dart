import 'package:shared_preferences/shared_preferences.dart';

class UserPreferences {
  static const String _keyAadharNumber = 'aadhar_number';

  // Save only Aadhar number
  static Future<void> saveAadharNumber(String aadharNumber) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyAadharNumber, aadharNumber);
  }

  // Get Aadhar Number
  static Future<String?> getAadharNumber() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAadharNumber);
  }

  // Clear Aadhar number (logout)
  static Future<void> clearAadharNumber() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyAadharNumber);
  }
}
