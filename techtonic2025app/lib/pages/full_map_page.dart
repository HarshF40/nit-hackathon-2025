import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/location_service.dart';
import '../components/complaint_dialog.dart';
import '../components/complaint_info_dialog.dart';
import '../components/radius_selector.dart';
import '../components/geofence_circle.dart';
import '../models/complaint_model.dart';
import '../utils/geofence_helper.dart';

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
  final List<ComplaintModel> _complaints = [];
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

  void _showComplaintDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) => ComplaintDialog(
        onComplaintSubmitted: (ComplaintModel complaint) {
          setState(() {
            _complaints.add(complaint);
          });
        },
      ),
    );
  }

  void _showComplaintInfo(ComplaintModel complaint) {
    showDialog(
      context: context,
      builder: (BuildContext context) =>
          ComplaintInfoDialog(complaint: complaint),
    );
  }

  List<ComplaintModel> get _filteredComplaints {
    if (_currentLocation == null) return [];

    return GeofenceHelper.filterByRadius(
      center: _currentLocation!,
      items: _complaints,
      radiusKm: _geofenceRadius,
      getLocation: (complaint) => complaint.location,
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
                    // Complaint markers (filtered by geofence)
                    ..._filteredComplaints.map(
                      (complaint) => Marker(
                        point: complaint.location,
                        width: 40,
                        height: 40,
                        child: GestureDetector(
                          onTap: () => _showComplaintInfo(complaint),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.red,
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
                              Icons.report_problem,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                      ),
                    ),
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
                            if (_filteredComplaints.isNotEmpty)
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
                                  '${_filteredComplaints.length}',
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

          // Floating Action Button (Add Complaint)
          Positioned(
            right: 16,
            bottom: 32,
            child: FloatingActionButton(
              onPressed: _showComplaintDialog,
              backgroundColor: Colors.blue,
              child: const Icon(Icons.add, color: Colors.white, size: 32),
            ),
          ),
        ],
      ),
    );
  }
}
