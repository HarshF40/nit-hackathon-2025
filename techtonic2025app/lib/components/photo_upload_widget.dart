import 'package:flutter/material.dart';

class PhotoUploadWidget extends StatelessWidget {
  final VoidCallback onTap;

  const PhotoUploadWidget({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 200,
        width: MediaQuery.of(context).size.width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[300]!, width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.add_a_photo,
                color: Colors.blue,
                size: 32,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Tap to capture or upload photo',
              style: TextStyle(
                color: Colors.black87,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Clear photo helps faster resolution',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
