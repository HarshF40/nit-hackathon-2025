import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../services/location_service.dart';
import '../components/complaint_info_dialog.dart';
import '../components/radius_selector.dart';
import '../components/geofence_circle.dart';
import '../config/env_config.dart';

class FullMapPage extends StatefulWidget {
  const FullMapPage({super.key});

  @override
  State<FullMapPage> createState() => _FullMapPageState();
}

class _FullMapPageState extends State<FullMapPage> {
  LatLng? _currentLocation;
  bool _isLoading = true;
  final MapController _mapController = MapController();
  double _currentZoom = 15.0;
  List<Map<String, dynamic>> _complaints = [];
  double _geofenceRadius = 5.0; // Default 5 km radius
  bool _showRadiusSelector = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoading = true;
    });

    final location = await LocationService.getCurrentLocation();

    if (mounted) {
      setState(() {
        _currentLocation =
            location ??
            LatLng(18.5204, 73.8567); // Default to Pune if location fails
        _isLoading = false;
      });
      _fetchComplaintsByRadius();
    }
  }

  Future<void> _fetchComplaintsByRadius() async {
    if (_currentLocation == null) return;
    final response = await http.post(
      Uri.parse('${EnvConfig.apiBaseUrl}/getComplaintsByRadius'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'latitude': _currentLocation!.latitude,
        'longitude': _currentLocation!.longitude,
        'radiusKm': _geofenceRadius,
      }),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        _complaints = List<Map<String, dynamic>>.from(data['complaints'] ?? []);
      });
    }
  }

  void _zoomIn() {
    setState(() {
      _currentZoom = (_currentZoom + 1).clamp(1.0, 18.0);
    });
    _mapController.move(
      _currentLocation ?? LatLng(18.5204, 73.8567),
      _currentZoom,
    );
  }

  void _zoomOut() {
    setState(() {
      _currentZoom = (_currentZoom - 1).clamp(1.0, 18.0);
    });
    _mapController.move(
      _currentLocation ?? LatLng(18.5204, 73.8567),
      _currentZoom,
    );
  }

  void _showComplaintInfoFromMap(Map<String, dynamic> complaint) {
    showDialog(
      context: context,
      builder: (BuildContext context) =>
          ComplaintInfoDialog(complaint: complaint),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Full Screen Map
          if (_isLoading)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 12),
                  Text(
                    'Loading map...',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            )
          else
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _currentLocation ?? LatLng(18.5204, 73.8567),
                initialZoom: _currentZoom,
                minZoom: 1.0,
                maxZoom: 18.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.techtonic.app',
                ),
                // Geofence Circle
                if (_currentLocation != null)
                  GeofenceCircle(
                    center: _currentLocation!,
                    radiusKm: _geofenceRadius,
                  ),
                MarkerLayer(
                  markers: [
                    // User location marker
                    if (_currentLocation != null)
                      Marker(
                        point: _currentLocation!,
                        width: 40,
                        height: 40,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.blue,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 6,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.person,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    // Complaint markers from backend
                    ..._complaints
                        .map((c) {
                          // Decode location if it's a string
                          final locRaw = c['location'];
                          final loc = (locRaw is String)
                              ? jsonDecode(locRaw)
                              : locRaw;
                          final latitude =
                              double.tryParse(loc['latitude'].toString()) ??
                              0.0;
                          final longitude =
                              double.tryParse(loc['longitude'].toString()) ??
                              0.0;
                          IconData icon = Icons.report_problem;
                          Color color = Colors.red;
                          switch (c['departmentType']) {
                            case 'ELEC':
                              icon = Icons.electric_bolt;
                              color = Colors.yellow[700]!;
                              break;
                            case 'GARB':
                              icon = Icons.delete;
                              color = Colors.green[700]!;
                              break;
                            case 'ROAD':
                              icon = Icons.traffic;
                              color = Colors.grey[700]!;
                              break;
                            case 'WATER':
                              icon = Icons.water_drop;
                              color = Colors.blue[700]!;
                              break;
                          }
                          return Marker(
                            point: LatLng(latitude, longitude),
                            width: 40,
                            height: 40,
                            child: GestureDetector(
                              onTap: () => _showComplaintInfoFromMap(c),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 3,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.3),
                                      blurRadius: 6,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  icon,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                          );
                        })
                        .whereType<Marker>()
                        .toList(),
                  ],
                ),
              ],
            ),

          // Top Bar with Back Button
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.black),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'Interactive Map',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black,
                                ),
                              ),
                            ),
                            if (_complaints.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '${_complaints.length}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Map Controls (Zoom)
          Positioned(
            left: 16,
            bottom: 120,
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.add, size: 24),
                    onPressed: _zoomIn,
                    padding: const EdgeInsets.all(12),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.remove, size: 24),
                    onPressed: _zoomOut,
                    padding: const EdgeInsets.all(12),
                  ),
                ),
                const SizedBox(height: 8),
                // Radius control button
                Container(
                  decoration: BoxDecoration(
                    color: _showRadiusSelector ? Colors.blue : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: Icon(
                      Icons.radar,
                      size: 24,
                      color: _showRadiusSelector ? Colors.white : Colors.blue,
                    ),
                    onPressed: () {
                      setState(() {
                        _showRadiusSelector = !_showRadiusSelector;
                      });
                    },
                    padding: const EdgeInsets.all(12),
                  ),
                ),
              ],
            ),
          ),

          // Radius Selector Panel
          if (_showRadiusSelector)
            Positioned(
              left: 80,
              bottom: 120,
              right: 16,
              child: RadiusSelector(
                currentRadius: _geofenceRadius,
                onRadiusChanged: (newRadius) {
                  setState(() {
                    _geofenceRadius = newRadius;
                  });
                  _fetchComplaintsByRadius();
                },
              ),
            ),

          // Current Location Button
          Positioned(
            right: 16,
            bottom: 120,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: IconButton(
                icon: const Icon(
                  Icons.my_location,
                  size: 24,
                  color: Colors.blue,
                ),
                onPressed: _getCurrentLocation,
                padding: const EdgeInsets.all(12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
