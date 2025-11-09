import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../components/location_card.dart';
import '../components/photo_upload_widget.dart';
import '../components/submit_report_button.dart';
import '../services/department_service.dart';
import '../utils/user_preferences.dart';

class ComplainDraft extends StatefulWidget {
  const ComplainDraft({super.key});

  @override
  State<ComplainDraft> createState() => _ComplainDraftState();
}

class _ComplainDraftState extends State<ComplainDraft> {
  List<Map<String, dynamic>> _departments = [];
  int? _selectedDepartmentId;
  String? _selectedCategory;
  String? _severity;
  String? _imageBase64;
  bool _isLoadingDepartments = true;
  bool _isLoadingLocation = true;
  final String _latitude = '15.5456923';
  final String _longitude = '73.7607543';
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadLocation();
    _fetchDepartments();
  }

  void _loadLocation() async {
    // Simulate loading location
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  Future<void> _fetchDepartments() async {
    try {
      final departments = await DepartmentService.getAllDepartments();
      if (mounted) {
        setState(() {
          _departments = departments;
          _isLoadingDepartments = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingDepartments = false;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load departments')));
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Submit New Report Button
              SubmitReportButton(
                title: 'Submit New Report',
                subtitle: 'Help us improve your community',
              ),
              const SizedBox(height: 16),
              // Location
              if (_isLoadingLocation)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Loading user data...',
                        style: TextStyle(color: Colors.black54, fontSize: 14),
                      ),
                    ],
                  ),
                )
              else
                LocationCard(
                  latitude: _latitude,
                  longitude: _longitude,
                  onRefresh: () {
                    setState(() {
                      _isLoadingLocation = true;
                    });
                    _loadLocation();
                  },
                ),
              const SizedBox(height: 24),
              // Image Picker (camera only)
              const Text(
                'Attach Photo',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Column(
                  children: [
                    PhotoUploadWidget(
                      onImageSelected: (base64) {
                        setState(() {
                          _imageBase64 = base64;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _imageBase64 == null
                          ? null
                          : () async {
                              final aiPrompt = '''
You are an information extraction system. Given an image and its context, extract ONLY the following complaint fields as a pure JSON object (no extra text, no explanation, no markdown):
{
  "issueTitle": "Short title for the complaint",
  "category": "One of: ELEC, GARB, ROAD, WATER",
  "description": "Short description for the image",
  "severity": "Integer from 1 to 10 (1 = lowest, 10 = highest)"
}
Respond ONLY with the JSON object above, nothing else.
''';
                              showDialog(
                                context: context,
                                barrierDismissible: false,
                                builder: (context) => const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              );
                              final response = await http.post(
                                Uri.parse(
                                  '${DepartmentService.baseUrl}/getAiSummary',
                                ),
                                headers: {'Content-Type': 'application/json'},
                                body: jsonEncode({
                                  'imageBase64': _imageBase64,
                                  'query': aiPrompt,
                                }),
                              );
                              Navigator.of(context).pop(); // Remove loader
                              if (response.statusCode == 200) {
                                final data = jsonDecode(response.body);
                                final summary = data['summary'];
                                print('🔍 AI Response summary: $summary');
                                if (mounted) {
                                  setState(() {
                                    if (summary['issueTitle'] != null &&
                                        summary['issueTitle']
                                            .toString()
                                            .isNotEmpty) {
                                      _titleController.text =
                                          summary['issueTitle'];
                                      print(
                                        '✅ Title set to: ${summary['issueTitle']}',
                                      );
                                    } else {
                                      print(
                                        '⚠️ issueTitle is null or empty in AI response',
                                      );
                                    }
                                    if (summary['category'] != null)
                                      _selectedCategory = summary['category'];
                                    if (summary['description'] != null)
                                      _descriptionController.text =
                                          summary['description'];
                                    if (summary['severity'] != null)
                                      _severity = summary['severity']
                                          .toString();
                                  });
                                }
                                if (mounted && context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('AI summary applied!'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                }
                              } else {
                                if (mounted && context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'AI summary failed: ${response.body}',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            },
                      child: const Text('Get AI Summary'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Department Dropdown (always editable)
              const Text(
                'Department',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              _isLoadingDepartments
                  ? const Center(child: CircularProgressIndicator())
                  : DropdownButtonFormField<int>(
                      value: _selectedDepartmentId,
                      decoration: const InputDecoration(
                        hintText: 'Select department',
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      items: _departments.map((dept) {
                        return DropdownMenuItem<int>(
                          value: dept['id'],
                          child: Text(dept['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: (int? newValue) {
                        setState(() {
                          _selectedDepartmentId = newValue;
                        });
                      },
                    ),
              const SizedBox(height: 24),
              // Category Dropdown (read-only after AI)
              const Text(
                'Category',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  hintText: 'Select category',
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                items: const [
                  DropdownMenuItem(value: 'ELEC', child: Text('Electricity')),
                  DropdownMenuItem(value: 'GARB', child: Text('Garbage')),
                  DropdownMenuItem(value: 'ROAD', child: Text('Roadways')),
                  DropdownMenuItem(value: 'WATER', child: Text('Water')),
                ],
                onChanged: null, // Read-only
              ),
              const SizedBox(height: 24),
              // Title (read-only after AI)
              const Text(
                'Issue Title',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!, width: 1),
                ),
                child: TextField(
                  controller: _titleController,
                  readOnly: true,
                  decoration: const InputDecoration(
                    hintText: 'Enter a brief title',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    prefixIcon: Icon(Icons.edit, color: Colors.blue),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Description (read-only after AI)
              const Text(
                'Description',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!, width: 1),
                ),
                child: TextField(
                  controller: _descriptionController,
                  maxLines: 5,
                  readOnly: true,
                  decoration: const InputDecoration(
                    hintText: 'Provide detailed description...',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.all(16),
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(top: 12, left: 12),
                      child: Icon(Icons.description, color: Colors.blue),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Severity (read-only)
              const Text(
                'Severity (AI)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!, width: 1),
                ),
                child: Text(
                  _severity ?? 'Pending',
                  style: const TextStyle(fontSize: 16, color: Colors.black54),
                ),
              ),
              const SizedBox(height: 24),
              // Address field
              const Text(
                'Address',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!, width: 1),
                ),
                child: TextField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    hintText: 'Enter address',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    prefixIcon: Icon(Icons.location_on, color: Colors.blue),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        // Clear all fields
                        _titleController.clear();
                        _descriptionController.clear();
                        _addressController.clear();
                        setState(() {
                          _selectedDepartmentId = null;
                          _selectedCategory = null;
                          _severity = null;
                          _imageBase64 = null;
                        });

                        // Show confirmation
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Form cleared'),
                            duration: Duration(seconds: 1),
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: Colors.grey[400]!),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Clear',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (_selectedDepartmentId == null ||
                            _selectedCategory == null ||
                            _titleController.text.isEmpty ||
                            _descriptionController.text.isEmpty ||
                            _addressController.text.isEmpty ||
                            _severity == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Please fill all required fields'),
                              backgroundColor: Colors.red,
                            ),
                          );
                          return;
                        }
                        final aadhar = await UserPreferences.getAadharNumber();
                        if (aadhar == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Aadhar number not found. Please login.',
                              ),
                              backgroundColor: Colors.red,
                            ),
                          );
                          return;
                        }
                        final location = {
                          'latitude': double.parse(_latitude),
                          'longitude': double.parse(_longitude),
                        };
                        print('Creating complaint with location: $location');

                        final isCritical =
                            int.tryParse(_severity ?? '0') != null &&
                            int.parse(_severity!) > 6;
                        final body = {
                          'departmentType': _selectedCategory,
                          'departmentId': _selectedDepartmentId,
                          'issueTitle': _titleController.text,
                          'description': _descriptionController.text,
                          'authorAadhar': aadhar,
                          'location': location,
                          'address': _addressController.text,
                          'imageBase64': _imageBase64,
                          'severity': _severity,
                          'isCritical': isCritical,
                          'status': 'PENDING',
                        };
                        final response = await http.post(
                          Uri.parse(
                            '${DepartmentService.baseUrl}/createComplaint',
                          ),
                          headers: {'Content-Type': 'application/json'},
                          body: jsonEncode(body),
                        );
                        if (response.statusCode == 201 ||
                            response.statusCode == 200) {
                          // Clear the form after successful submission
                          if (mounted) {
                            _titleController.clear();
                            _descriptionController.clear();
                            _addressController.clear();
                            setState(() {
                              _selectedDepartmentId = null;
                              _selectedCategory = null;
                              _severity = null;
                              _imageBase64 = null;
                            });
                          }

                          if (mounted && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Complaint submitted successfully!',
                                ),
                                backgroundColor: Colors.green,
                              ),
                            );
                          }
                        } else {
                          if (mounted && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Error: ${response.body}'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.send, color: Colors.white, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Submit Report',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
