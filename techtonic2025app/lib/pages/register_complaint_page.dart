import 'package:flutter/material.dart';
import '../components/complaint_dialog.dart';

class RegisterComplaintPage extends StatefulWidget {
  const RegisterComplaintPage({super.key});

  @override
  State<RegisterComplaintPage> createState() => _RegisterComplaintPageState();
}

class _RegisterComplaintPageState extends State<RegisterComplaintPage> {
  @override
  void initState() {
    super.initState();
    // Show dialog after build completes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _showComplaintDialog();
      }
    });
  }

  void _showComplaintDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return WillPopScope(
          onWillPop: () async {
            // Prevent back button on dialog
            return false;
          },
          child: ComplaintDialog(
            onComplaintSubmitted: (complaint) {
              // Close the dialog
              Navigator.of(dialogContext).pop();

              // Show success message
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Complaint registered successfully!'),
                    backgroundColor: Colors.green,
                    duration: Duration(seconds: 2),
                  ),
                );
              }

              // Go back to previous page after a short delay
              Future.delayed(const Duration(milliseconds: 300), () {
                if (mounted && Navigator.canPop(context)) {
                  Navigator.of(context).pop();
                }
              });
            },
          ),
        );
      },
    ).then((_) {
      // When dialog is dismissed (cancel button clicked)
      if (mounted && Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Register Complaint',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1261A0),
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            // Close any open dialogs first
            if (Navigator.canPop(context)) {
              Navigator.of(context).pop();
            }
          },
        ),
      ),
      backgroundColor: const Color(0xFFF5F9FC),
      body: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1261A0)),
        ),
      ),
    );
  }
}
