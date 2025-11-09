import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';
import '../utils/user_preferences.dart';

class StatisticsDetailPage extends StatefulWidget {
  final String title;
  final String count;
  final IconData icon;
  final Color backgroundColor;
  final String type; // 'total', 'ongoing', 'pending', 'completed'

  const StatisticsDetailPage({
    super.key,
    required this.title,
    required this.count,
    required this.icon,
    required this.backgroundColor,
    required this.type,
  });

  @override
  State<StatisticsDetailPage> createState() => _StatisticsDetailPageState();
}

class _StatisticsDetailPageState extends State<StatisticsDetailPage> {
  bool _isLoading = true;
  List<RequestItem> _filteredRequests = [];

  @override
  void initState() {
    super.initState();
    _fetchComplaints();
  }

  Future<void> _fetchComplaints() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final aadhar = await UserPreferences.getAadharNumber();
      if (aadhar == null) {
        if (mounted) {
          setState(() {
            _filteredRequests = [];
            _isLoading = false;
          });
        }
        return;
      }

      final response = await http.post(
        Uri.parse('${EnvConfig.apiBaseUrl}/getComplaintsByAadhar'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'aadhar': aadhar}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final complaints = data['complaints'] ?? [];

        List<RequestItem> allItems = [];
        for (final complaint in complaints) {
          final title = complaint['issueTitle']?.toString().trim();
          allItems.add(
            RequestItem(
              id: complaint['id']?.toString() ?? 'N/A',
              title: (title != null && title.isNotEmpty)
                  ? title
                  : 'Untitled Request',
              description: complaint['description'] ?? 'No description',
              status: complaint['status'] ?? 'PENDING',
              date: complaint['createdAt'] != null
                  ? DateTime.parse(complaint['createdAt'])
                  : DateTime.now(),
              location: complaint['address'] ?? 'Unknown location',
            ),
          );
        }

        if (mounted) {
          setState(() {
            _filteredRequests = _filterRequestsByType(allItems);
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _filteredRequests = [];
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _filteredRequests = [];
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error fetching complaints: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  List<RequestItem> _filterRequestsByType(List<RequestItem> items) {
    switch (widget.type) {
      case 'total':
        return items;
      case 'ongoing':
        // Accept both 'ONGOING' and 'INPROGRESS' statuses
        return items
            .where(
              (item) => item.status == 'ONGOING' || item.status == 'INPROGRESS',
            )
            .toList();
      case 'pending':
        return items.where((item) => item.status == 'PENDING').toList();
      case 'completed':
        return items.where((item) => item.status == 'COMPLETED').toList();
      default:
        return items;
    }
  }

  // Mock data - Replace with actual API call based on type
  List<RequestItem> _getRequestItems() {
    return _filteredRequests;
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return const Color(0xFFAB47BC);
      case 'ONGOING':
      case 'INPROGRESS':
        return const Color(0xFFFF9800);
      case 'PENDING':
        return const Color(0xFF66BB6A);
      default:
        return Colors.grey;
    }
  }

  String _getEmptyMessage() {
    switch (widget.type) {
      case 'total':
        return 'No requests found';
      case 'ongoing':
        return 'No ongoing requests';
      case 'pending':
        return 'No pending requests';
      case 'completed':
        return 'No completed requests';
      default:
        return 'No data available';
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _getRequestItems();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F9FC),
      appBar: AppBar(
        backgroundColor: widget.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: () {
              // TODO: Implement filter functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Filter functionality coming soon'),
                  duration: Duration(seconds: 1),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Header Card
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: widget.backgroundColor,
              borderRadius: const BorderRadius.only(
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
                  child: Icon(widget.icon, size: 50, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Text(
                  widget.count,
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.title,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // List of requests
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : items.isEmpty
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
                          _getEmptyMessage(),
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
                    onRefresh: _fetchComplaints,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        final item = items[index];
                        return _buildRequestCard(item);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestCard(RequestItem item) {
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            // TODO: Navigate to request detail page
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Clicked on ${item.id}'),
                duration: const Duration(seconds: 1),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Request ID
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: widget.backgroundColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        item.id,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: widget.backgroundColor,
                        ),
                      ),
                    ),
                    // Status Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(item.status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        item.status,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _getStatusColor(item.status),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Title
                Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 8),
                // Description
                Text(
                  item.description,
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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
                        item.location,
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
                      _formatDate(item.date),
                      style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
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

class RequestItem {
  final String id;
  final String title;
  final String description;
  final String status;
  final DateTime date;
  final String location;

  RequestItem({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.date,
    required this.location,
  });
}
