import 'package:flutter/material.dart';
import '../components/custom_app_bar.dart';
import '../components/statistics_card.dart';
import '../components/map_card.dart';
import '../components/custom_bottom_nav_bar.dart';
import 'complaindraft.dart';
import 'socialmedia.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

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
                    // Handle refresh
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 0.9,
                    child: StatisticsCard(
                      title: 'Total Requests',
                      count: '8',
                      icon: Icons.description,
                      backgroundColor: const Color(0xFF3B9DFF),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 0.9,
                    child: StatisticsCard(
                      title: 'Ongoing requests',
                      count: '2',
                      icon: Icons.access_time,
                      backgroundColor: const Color(0xFFFF9800),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 0.9,
                    child: StatisticsCard(
                      title: 'Pending requests',
                      count: '3',
                      icon: Icons.hourglass_empty,
                      backgroundColor: const Color(0xFF66BB6A),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 0.9,
                    child: StatisticsCard(
                      title: 'Completed requests',
                      count: '3',
                      icon: Icons.check_circle_outline,
                      backgroundColor: const Color(0xFFAB47BC),
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
        return const Center(child: Text('Leaderboard Coming Soon'));
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
