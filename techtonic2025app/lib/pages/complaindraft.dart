import 'package:flutter/material.dart';
import '../components/custom_app_bar.dart';
import '../components/custom_bottom_nav_bar.dart';
import '../components/location_card.dart';
import '../components/photo_upload_widget.dart';
import '../components/submit_report_button.dart';

class ComplainDraft extends StatefulWidget {
  const ComplainDraft({super.key});

  @override
  State<ComplainDraft> createState() => _ComplainDraftState();
}

class _ComplainDraftState extends State<ComplainDraft> {
  int _currentIndex = 1; // Complain tab
  String _selectedDepartment = '';
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  bool _isLoadingLocation = true;
  final String _latitude = '15.5456923';
  final String _longitude = '73.7607543';
  @override
  void initState() {
    super.initState();
    _loadLocation();
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

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: const CustomAppBar(title: 'Report Issue'),
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
              // Current Location Card or Loading
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
              // Category Dropdown
              const Row(
                children: [
                  Text(
                    'Category',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(width: 4),
                  Text('*', style: TextStyle(color: Colors.red, fontSize: 16)),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!, width: 1),
                ),
                child: DropdownButtonFormField<String>(
                  value: _selectedDepartment.isEmpty
                      ? null
                      : _selectedDepartment,
                  decoration: const InputDecoration(
                    hintText: 'Select department',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  icon: const Icon(
                    Icons.keyboard_arrow_down,
                    color: Colors.blue,
                  ),
                  items:
                      [
                        'Roads & Infrastructure',
                        'Water Supply',
                        'Electricity',
                        'Sanitation',
                        'Public Safety',
                        'Other',
                      ].map((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value),
                        );
                      }).toList(),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedDepartment = newValue ?? '';
                    });
                  },
                ),
              ),
              const SizedBox(height: 24),
              // Attach Photo
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
                child: PhotoUploadWidget(
                  onTap: () {
                    // Handle photo upload
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Issue Title
              const Row(
                children: [
                  Text(
                    'Issue Title',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(width: 4),
                  Text('*', style: TextStyle(color: Colors.red, fontSize: 16)),
                ],
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

              // Description
              const Row(
                children: [
                  Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(width: 4),
                  Text('*', style: TextStyle(color: Colors.red, fontSize: 16)),
                ],
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
              const SizedBox(height: 32),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: Colors.grey[400]!),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Cancel',
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
                      onPressed: () {
                        // Handle submit
                        if (_selectedDepartment.isEmpty ||
                            _titleController.text.isEmpty ||
                            _descriptionController.text.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Please fill all required fields'),
                              backgroundColor: Colors.red,
                            ),
                          );
                          return;
                        }
                        // Submit logic here
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
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          if (index == 0) {
            Navigator.pop(context);
          }
        },
      ),
    );
  }
}
