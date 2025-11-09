import 'package:flutter/material.dart';
import '../components/custom_app_bar.dart';
import '../components/statistics_card.dart';
import '../components/map_card.dart';
import '../components/custom_bottom_nav_bar.dart';
import 'complaindraft.dart';
import 'socialmedia.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/user_preferences.dart';
import '../config/env_config.dart';
import 'leaderboard.dart';
import 'statistics_detail_page.dart';
import 'ongoing_complaints_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

  int totalRequests = 0;
  int ongoingRequests = 0;
  int pendingRequests = 0;
  int completedRequests = 0;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _fetchComplaintStats();
  }

  Future<void> _fetchComplaintStats() async {
    setState(() {
      _isLoadingStats = true;
    });
    final aadhar = await UserPreferences.getAadharNumber();
    if (aadhar == null) {
      setState(() {
        totalRequests = 0;
        ongoingRequests = 0;
        pendingRequests = 0;
        completedRequests = 0;
        _isLoadingStats = false;
      });
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
      int ongoing = 0, pending = 0, completed = 0;
      for (final c in complaints) {
        switch (c['status']) {
          case 'ONGOING':
          case 'INPROGRESS':
            ongoing++;
            break;
          case 'PENDING':
            pending++;
            break;
          case 'COMPLETED':
            completed++;
            break;
        }
      }
      setState(() {
        totalRequests = complaints.length;
        ongoingRequests = ongoing;
        pendingRequests = pending;
        completedRequests = completed;
        _isLoadingStats = false;
      });
    } else {
      setState(() {
        _isLoadingStats = false;
      });
    }
  }

  Widget _buildHomeContent() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome back, User!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Great to see you today!',
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            const MapCard(),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Request Statistics',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.blue),
                  onPressed: () {
                    _fetchComplaintStats();
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => StatisticsDetailPage(
                            title: 'Total Requests',
                            count: totalRequests.toString(),
                            icon: Icons.description,
                            backgroundColor: const Color(0xFF3B9DFF),
                            type: 'total',
                          ),
                        ),
                      );
                    },
                    child: AspectRatio(
                      aspectRatio: 0.9,
                      child: StatisticsCard(
                        title: 'Total Requests',
                        count: _isLoadingStats ? '-' : totalRequests.toString(),
                        icon: Icons.description,
                        backgroundColor: const Color(0xFF3B9DFF),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      // Navigate to the new OngoingComplaintsPage
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const OngoingComplaintsPage(),
                        ),
                      );
                    },
                    child: AspectRatio(
                      aspectRatio: 0.9,
                      child: StatisticsCard(
                        title: 'Ongoing requests',
                        count: _isLoadingStats
                            ? '-'
                            : ongoingRequests.toString(),
                        icon: Icons.access_time,
                        backgroundColor: const Color(0xFFFF9800),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => StatisticsDetailPage(
                            title: 'Pending Requests',
                            count: pendingRequests.toString(),
                            icon: Icons.hourglass_empty,
                            backgroundColor: const Color(0xFF66BB6A),
                            type: 'pending',
                          ),
                        ),
                      );
                    },
                    child: AspectRatio(
                      aspectRatio: 0.9,
                      child: StatisticsCard(
                        title: 'Pending requests',
                        count: _isLoadingStats
                            ? '-'
                            : pendingRequests.toString(),
                        icon: Icons.hourglass_empty,
                        backgroundColor: const Color(0xFF66BB6A),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => StatisticsDetailPage(
                            title: 'Completed Requests',
                            count: completedRequests.toString(),
                            icon: Icons.check_circle_outline,
                            backgroundColor: const Color(0xFFAB47BC),
                            type: 'completed',
                          ),
                        ),
                      );
                    },
                    child: AspectRatio(
                      aspectRatio: 0.9,
                      child: StatisticsCard(
                        title: 'Completed requests',
                        count: _isLoadingStats
                            ? '-'
                            : completedRequests.toString(),
                        icon: Icons.check_circle_outline,
                        backgroundColor: const Color(0xFFAB47BC),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _getPage(int index) {
    switch (index) {
      case 0:
        return _buildHomeContent();
      case 1:
        return const ComplainDraft();
      case 2:
        return const LeaderboardPage();
      case 3:
        return const SocialMediaPage();
      default:
        return const Center(child: Text('Page not found'));
    }
  }

  String _getTitle(int index) {
    switch (index) {
      case 0:
        return 'Home';
      case 1:
        return 'Complain';
      case 2:
        return 'Leaderboard';
      case 3:
        return 'Social';
      default:
        return 'TechTonic';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: CustomAppBar(title: _getTitle(_currentIndex)),
      body: _getPage(_currentIndex),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
