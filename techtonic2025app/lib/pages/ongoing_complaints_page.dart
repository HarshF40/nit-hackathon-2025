import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';
import '../utils/user_preferences.dart';

class OngoingComplaintsPage extends StatefulWidget {
  const OngoingComplaintsPage({super.key});

  @override
  State<OngoingComplaintsPage> createState() => _OngoingComplaintsPageState();
}

class _OngoingComplaintsPageState extends State<OngoingComplaintsPage> {
  bool _isLoading = true;
  List<OngoingComplaint> _complaints = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchOngoingComplaints();
  }

  Future<void> _fetchOngoingComplaints() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final aadhar = await UserPreferences.getAadharNumber();
      if (aadhar == null) {
        setState(() {
          _errorMessage = 'Aadhar number not found. Please log in again.';
          _isLoading = false;
        });
        return;
      }

      final response = await http.post(
        Uri.parse('${EnvConfig.apiBaseUrl}/getInProgressComplaintsByAadhar'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'aadhar': aadhar}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final complaints = data['complaints'] ?? [];

        List<OngoingComplaint> loadedComplaints = [];
        for (final complaint in complaints) {
          loadedComplaints.add(
            OngoingComplaint(
              id: complaint['id']?.toString() ?? 'N/A',
              title:
                  complaint['issueTitle']?.toString().trim().isNotEmpty == true
                  ? complaint['issueTitle']
                  : 'Untitled Complaint',
              description: complaint['description'] ?? 'No description',
              type: complaint['type'] ?? 'General',
              location: complaint['address'] ?? 'Unknown location',
              status: complaint['status'] ?? 'INPROGRESS',
              progress: (complaint['percentageComplete'] ?? 0).toDouble(),
              downvotes: complaint['downvotes'] ?? 0,
              createdAt: complaint['dateTime'] != null
                  ? DateTime.parse(complaint['dateTime'])
                  : DateTime.now(),
              imageUrl: complaint['imageURL'],
            ),
          );
        }

        setState(() {
          _complaints = loadedComplaints;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to fetch complaints: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _downvoteComplaint(
    String complaintId,
    int currentDownvotes,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('${EnvConfig.apiBaseUrl}/downvoteComplaint'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'complaintId': int.parse(complaintId)}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newDownvoteCount =
            data['newDownvoteCount'] ?? currentDownvotes + 1;

        // Update local state
        setState(() {
          final index = _complaints.indexWhere((c) => c.id == complaintId);
          if (index != -1) {
            _complaints[index] = _complaints[index].copyWith(
              downvotes: newDownvoteCount,
            );
          }
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Complaint downvoted successfully'),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 2),
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to downvote: ${response.statusCode}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error downvoting complaint: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F9FC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFF9800),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Ongoing Complaints',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _fetchOngoingComplaints,
          ),
        ],
      ),
      body: Column(
        children: [
          // Header Card
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFFF9800),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.access_time,
                    size: 50,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _isLoading ? '-' : _complaints.length.toString(),
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Complaints In Progress',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // List of complaints
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 80,
                          color: Colors.red[300],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _errorMessage!,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchOngoingComplaints,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _complaints.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inbox_outlined,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No ongoing complaints',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchOngoingComplaints,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: _complaints.length,
                      itemBuilder: (context, index) {
                        final complaint = _complaints[index];
                        return _buildComplaintCard(complaint);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildComplaintCard(OngoingComplaint complaint) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Complaint ID
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF9800).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '#${complaint.id}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFFF9800),
                    ),
                  ),
                ),
                // Downvote Button
                InkWell(
                  onTap: () => _showDownvoteConfirmation(complaint),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.thumb_down,
                          size: 16,
                          color: Colors.red,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${complaint.downvotes}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Title
            Text(
              complaint.title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),

            // Type Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                complaint.type,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue,
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Description
            Text(
              complaint.description,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),

            // Progress Section
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Progress',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      '${complaint.progress.toInt()}%',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFFF9800),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                // Progress Bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: complaint.progress / 100,
                    backgroundColor: Colors.grey[200],
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      Color(0xFFFF9800),
                    ),
                    minHeight: 8,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Footer Row
            Row(
              children: [
                Icon(
                  Icons.location_on_outlined,
                  size: 16,
                  color: Colors.grey[500],
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    complaint.location,
                    style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 16),
                Icon(
                  Icons.calendar_today_outlined,
                  size: 16,
                  color: Colors.grey[500],
                ),
                const SizedBox(width: 4),
                Text(
                  _formatDate(complaint.createdAt),
                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showDownvoteConfirmation(OngoingComplaint complaint) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Downvote Complaint'),
          content: const Text(
            'Are you sure you want to downvote this complaint? This will signal that the work progress is not satisfactory.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _downvoteComplaint(complaint.id, complaint.downvotes);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Downvote'),
            ),
          ],
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}

class OngoingComplaint {
  final String id;
  final String title;
  final String description;
  final String type;
  final String location;
  final String status;
  final double progress;
  final int downvotes;
  final DateTime createdAt;
  final String? imageUrl;

  OngoingComplaint({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.location,
    required this.status,
    required this.progress,
    required this.downvotes,
    required this.createdAt,
    this.imageUrl,
  });

  OngoingComplaint copyWith({
    String? id,
    String? title,
    String? description,
    String? type,
    String? location,
    String? status,
    double? progress,
    int? downvotes,
    DateTime? createdAt,
    String? imageUrl,
  }) {
    return OngoingComplaint(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      location: location ?? this.location,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      downvotes: downvotes ?? this.downvotes,
      createdAt: createdAt ?? this.createdAt,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}
