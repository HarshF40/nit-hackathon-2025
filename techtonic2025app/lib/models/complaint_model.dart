import 'dart:io';
import 'package:latlong2/latlong.dart';

class ComplaintModel {
  final String category;
  final String title;
  final String description;
  final LatLng location;
  final String latitude;
  final String longitude;
  final File? image;
  final DateTime timestamp;

  ComplaintModel({
    required this.category,
    required this.title,
    required this.description,
    required this.location,
    required this.latitude,
    required this.longitude,
    this.image,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}
