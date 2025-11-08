import 'package:flutter/material.dart';

class LeaderboardPage extends StatefulWidget {
  const LeaderboardPage({super.key});

  @override
  State<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends State<LeaderboardPage> {
  bool _showAll = false;
  bool _isLoading = false;

  // Mock data - Replace with actual API call
  final List<LeaderboardEntry> _allEntries = List.generate(
    100,
    (index) => LeaderboardEntry(
      rank: index + 1,
      name: 'User ${index + 1}',
      aadharLast4: '${1000 + index}',
      points: 10000 - (index * 50),
      complaintsResolved: 100 - index,
    ),
  );

  List<LeaderboardEntry> get _displayedEntries {
    return _showAll ? _allEntries : _allEntries.take(10).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1261A0), Color(0xFFF5F9FC)],
            stops: [0.0, 0.4],
          ),
        ),
        child: SafeArea(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : CustomScrollView(
                  slivers: [
                    // Header
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            const SizedBox(height: 16),
                            const Text(
                              '🏆 Leaderboard',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Top Contributors',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.white.withOpacity(0.9),
                                fontWeight: FontWeight.w300,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Podium for Top 3
                    if (_allEntries.length >= 3)
                      SliverToBoxAdapter(child: _buildPodium()),

                    SliverToBoxAdapter(child: const SizedBox(height: 24)),

                    // Container with rounded top
                    SliverToBoxAdapter(
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Color(0xFFF5F9FC),
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(30),
                            topRight: Radius.circular(30),
                          ),
                        ),
                        child: const SizedBox(height: 20),
                      ),
                    ),

                    // Rest of the list
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final entry = _displayedEntries[index + 3];
                          return _buildLeaderboardItem(entry);
                        }, childCount: _displayedEntries.length - 3),
                      ),
                    ),

                    // See More / Show Less Button
                    if (!_showAll && _allEntries.length > 10)
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1261A0), Color(0xFF3895D3)],
                              ),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(
                                    0xFF1261A0,
                                  ).withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  _showAll = true;
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Text(
                                    'See Top 100',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(
                                    Icons.arrow_downward,
                                    color: Colors.white,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (_showAll)
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: TextButton.icon(
                            onPressed: () {
                              setState(() {
                                _showAll = false;
                              });
                            },
                            icon: const Icon(Icons.arrow_upward),
                            label: const Text('Show Less'),
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFF1261A0),
                            ),
                          ),
                        ),
                      ),

                    // Bottom padding
                    const SliverToBoxAdapter(child: SizedBox(height: 20)),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildPodium() {
    final first = _allEntries[0];
    final second = _allEntries[1];
    final third = _allEntries[2];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Second Place
          Expanded(
            child: _buildPodiumItem(
              entry: second,
              color: const Color(0xFFC0C0C0), // Silver
              height: 140,
              icon: '🥈',
            ),
          ),
          const SizedBox(width: 8),
          // First Place
          Expanded(
            child: _buildPodiumItem(
              entry: first,
              color: const Color(0xFFFFD700), // Gold
              height: 180,
              icon: '🥇',
            ),
          ),
          const SizedBox(width: 8),
          // Third Place
          Expanded(
            child: _buildPodiumItem(
              entry: third,
              color: const Color(0xFFCD7F32), // Bronze
              height: 120,
              icon: '🥉',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumItem({
    required LeaderboardEntry entry,
    required Color color,
    required double height,
    required String icon,
  }) {
    return Column(
      children: [
        // Avatar and Icon
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            border: Border.all(color: color, width: 3),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.4),
                blurRadius: 10,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Center(
            child: Text(icon, style: const TextStyle(fontSize: 30)),
          ),
        ),
        const SizedBox(height: 8),
        // Name
        Text(
          '*${entry.aadharLast4}',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        // Points
        Text(
          '${entry.points} pts',
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.9),
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        // Podium
        Container(
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [color, color.withOpacity(0.7)],
            ),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '#${entry.rank}',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    shadows: [
                      Shadow(
                        color: Colors.black26,
                        offset: Offset(2, 2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${entry.complaintsResolved}',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Text(
                  'resolved',
                  style: TextStyle(fontSize: 10, color: Colors.white),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderboardItem(LeaderboardEntry entry) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFF1261A0).withOpacity(0.1),
                const Color(0xFF3895D3).withOpacity(0.1),
              ],
            ),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '#${entry.rank}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1261A0),
              ),
            ),
          ),
        ),
        title: Text(
          '*${entry.aadharLast4}',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${entry.complaintsResolved} complaints resolved',
          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1261A0), Color(0xFF3895D3)],
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '${entry.points} pts',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class LeaderboardEntry {
  final int rank;
  final String name;
  final String aadharLast4;
  final int points;
  final int complaintsResolved;

  LeaderboardEntry({
    required this.rank,
    required this.name,
    required this.aadharLast4,
    required this.points,
    required this.complaintsResolved,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'] ?? 0,
      name: json['name'] ?? 'Unknown',
      aadharLast4: json['aadharLast4'] ?? '0000',
      points: json['points'] ?? 0,
      complaintsResolved: json['complaintsResolved'] ?? 0,
    );
  }
}
