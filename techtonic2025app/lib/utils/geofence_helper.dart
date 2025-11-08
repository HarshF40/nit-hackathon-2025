import 'dart:math' as math;
import 'package:latlong2/latlong.dart';

class GeofenceHelper {
  /// Calculate distance between two coordinates in kilometers using Haversine formula
  static double calculateDistance(LatLng point1, LatLng point2) {
    const double earthRadius = 6371; // Earth's radius in kilometers

    final double lat1Rad = _degreesToRadians(point1.latitude);
    final double lat2Rad = _degreesToRadians(point2.latitude);
    final double deltaLatRad = _degreesToRadians(
      point2.latitude - point1.latitude,
    );
    final double deltaLonRad = _degreesToRadians(
      point2.longitude - point1.longitude,
    );

    final double a =
        math.sin(deltaLatRad / 2) * math.sin(deltaLatRad / 2) +
        math.cos(lat1Rad) *
            math.cos(lat2Rad) *
            math.sin(deltaLonRad / 2) *
            math.sin(deltaLonRad / 2);

    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

    return earthRadius * c;
  }

  /// Check if a point is within the geofence radius
  static bool isWithinRadius(LatLng center, LatLng point, double radiusKm) {
    final double distance = calculateDistance(center, point);
    return distance <= radiusKm;
  }

  /// Convert degrees to radians
  static double _degreesToRadians(double degrees) {
    return degrees * math.pi / 180;
  }

  /// Get all points within radius from a list
  static List<T> filterByRadius<T>({
    required LatLng center,
    required List<T> items,
    required double radiusKm,
    required LatLng Function(T) getLocation,
  }) {
    return items.where((item) {
      final location = getLocation(item);
      return isWithinRadius(center, location, radiusKm);
    }).toList();
  }
}
