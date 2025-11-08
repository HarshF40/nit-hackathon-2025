import 'package:flutter/material.dart';
import '../components/custom_app_bar.dart';
import '../components/statistics_card.dart';
import '../components/map_card.dart';
import '../components/custom_bottom_nav_bar.dart';
import 'complaindraft.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: const CustomAppBar(title: 'Home'),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
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

              // Interactive Map Card
              const MapCard(),
              const SizedBox(height: 24),

              // Request Statistics Section
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

              // Statistics Cards Grid
              Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: AspectRatio(
                          aspectRatio: 0.9,
                          child: StatisticsCard(
                            title: 'Total Requests',
                            count: '8',
                            icon: Icons.description,
                            backgroundColor: Color(0xFF3B9DFF),
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
                            backgroundColor: Color(0xFFFF9800),
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
                            backgroundColor: Color(0xFF66BB6A),
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
                            backgroundColor: Color(0xFFAB47BC),
                          ),
                        ),
                      ),
                    ],
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
          if (index == 1) {
            // Navigate to ComplainDraft page
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ComplainDraft()),
            );
          } else {
            setState(() {
              _currentIndex = index;
            });
            // Handle navigation to other pages
          }
        },
      ),
    );
  }
}
