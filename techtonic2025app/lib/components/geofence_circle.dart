import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class GeofenceCircle extends StatelessWidget {
  final LatLng center;
  final double radiusKm;

  const GeofenceCircle({
    super.key,
    required this.center,
    required this.radiusKm,
  });

  @override
  Widget build(BuildContext context) {
    return CircleLayer(
      circles: [
        CircleMarker(
          point: center,
          radius: radiusKm * 1000, // Convert km to meters
          useRadiusInMeter: true,
          color: Colors.blue.withOpacity(0.1),
          borderColor: Colors.blue.withOpacity(0.5),
          borderStrokeWidth: 2,
        ),
      ],
    );
  }
}
