import 'package:flutter/material.dart';
import '../components/complaint_dialog.dart';
import '../models/complaint_model.dart';

class RegisterComplaintPage extends StatelessWidget {
  const RegisterComplaintPage({super.key});

  void _handleComplaintSubmitted(
    BuildContext context,
    ComplaintModel complaint,
  ) {
    // Optionally handle complaint after submission (e.g., show confirmation)
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Complaint registered!'),
        backgroundColor: Colors.green,
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Complaint'),
        backgroundColor: Colors.blue,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ComplaintDialog(
            onComplaintSubmitted: (complaint) =>
                _handleComplaintSubmitted(context, complaint),
          ),
        ),
      ),
    );
  }
}
