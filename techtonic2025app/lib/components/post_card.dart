import 'package:flutter/material.dart';
import '../services/post_service.dart';

class Post {
  final String description;
  final Map<String, double> location;
  final String? imageUrl;
  final String authorAadhar;
  final String dateTime;
  int upvote;
  int downvote;
  final String id;
  bool userUpvoted;
  bool userDownvoted;

  Post({
    required this.description,
    required this.location,
    this.imageUrl,
    required this.authorAadhar,
    required this.dateTime,
    this.upvote = 0,
    this.downvote = 0,
    required this.id,
    this.userUpvoted = false,
    this.userDownvoted = false,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'].toString(),
      description: json['description'],
      location: Map<String, double>.from(json['location']),
      imageUrl: json['imageUrl'],
      authorAadhar: json['authorAadhar'],
      dateTime: json['dateTime'],
      upvote: json['upvotes'] ?? 0,
      downvote: json['downvotes'] ?? 0,
      userUpvoted: json['userUpvoted'] ?? false,
      userDownvoted: json['userDownvoted'] ?? false,
    );
  }

  String get timeAgo {
    final now = DateTime.now();
    final postTime = DateTime.parse(dateTime);
    final difference = now.difference(postTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  String get authorPreview {
    // Show only last 4 digits of Aadhar with asterisk prefix
    if (authorAadhar.length >= 4) {
      return '*${authorAadhar.substring(authorAadhar.length - 4)}';
    } else {
      return '*${authorAadhar}';
    }
  }

  String get locationPreview {
    return 'Lat: ${location['latitude']?.toStringAsFixed(2)}, Long: ${location['longitude']?.toStringAsFixed(2)}';
  }
}

class PostCard extends StatefulWidget {
  final Post post;
  final VoidCallback? onTap;
  final VoidCallback? onComment;

  const PostCard({Key? key, required this.post, this.onTap, this.onComment})
    : super(key: key);

  @override
  _PostCardState createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  void _handleUpvote() async {
    final previousUpvoted = widget.post.userUpvoted;
    final previousDownvoted = widget.post.userDownvoted;
    setState(() {
      if (widget.post.userUpvoted) {
        widget.post.upvote--;
        widget.post.userUpvoted = false;
      } else {
        if (widget.post.userDownvoted) {
          widget.post.upvote++;
          widget.post.downvote--;
          widget.post.userDownvoted = false;
        } else {
          widget.post.upvote++;
        }
        widget.post.userUpvoted = true;
      }
    });
    // Call API
    final success = await PostService.updateVote(
      postId: widget.post.id,
      type: 'upvote',
    );
    if (!success) {
      // Revert UI if API fails
      setState(() {
        widget.post.userUpvoted = previousUpvoted;
        widget.post.userDownvoted = previousDownvoted;
        // Recalculate upvote/downvote
        if (previousUpvoted) {
          widget.post.upvote--;
        }
        if (previousDownvoted) {
          widget.post.downvote++;
        }
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Failed to update upvote.')));
    }
  }

  void _handleDownvote() async {
    final previousUpvoted = widget.post.userUpvoted;
    final previousDownvoted = widget.post.userDownvoted;
    setState(() {
      if (widget.post.userDownvoted) {
        widget.post.downvote--;
        widget.post.userDownvoted = false;
      } else {
        if (widget.post.userUpvoted) {
          widget.post.upvote--;
          widget.post.downvote++;
          widget.post.userUpvoted = false;
        } else {
          widget.post.downvote++;
        }
        widget.post.userDownvoted = true;
      }
    });
    // Call API
    final success = await PostService.updateVote(
      postId: widget.post.id,
      type: 'downvote',
    );
    if (!success) {
      // Revert UI if API fails
      setState(() {
        widget.post.userUpvoted = previousUpvoted;
        widget.post.userDownvoted = previousDownvoted;
        // Recalculate upvote/downvote
        if (previousUpvoted) {
          widget.post.upvote++;
        }
        if (previousDownvoted) {
          widget.post.downvote--;
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update downvote.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18.0)),
      margin: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 18.0),
      color: Colors.white,
      shadowColor: Colors.blueGrey.withOpacity(0.2),
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(18.0),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.blueGrey[100],
                    child: Icon(Icons.person, color: Colors.blueGrey[700]),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.post.authorPreview,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15.0,
                          ),
                        ),
                        Text(
                          widget.post.timeAgo,
                          style: TextStyle(
                            color: Colors.grey[500],
                            fontSize: 12.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10.0),
              Text(
                widget.post.description,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 17.0,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 8.0),
              Text(
                widget.post.locationPreview,
                style: TextStyle(fontSize: 13.0, color: Colors.blueGrey[400]),
              ),
              if (widget.post.imageUrl != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12.0),
                    child: Image.network(
                      widget.post.imageUrl!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: 180.0,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey[200],
                          height: 180.0,
                          child: const Center(
                            child: Text('Error loading image'),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              const SizedBox(height: 8.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          Icons.arrow_upward,
                          color: widget.post.userUpvoted
                              ? Colors.orange
                              : Colors.grey[400],
                        ),
                        onPressed: _handleUpvote,
                        splashRadius: 22,
                      ),
                      Text(
                        widget.post.upvote.toString(),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15.0,
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          Icons.arrow_downward,
                          color: widget.post.userDownvoted
                              ? Colors.blue
                              : Colors.grey[400],
                        ),
                        onPressed: _handleDownvote,
                        splashRadius: 22,
                      ),
                      Text(
                        widget.post.downvote.toString(),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15.0,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.comment, color: Colors.blueGrey),
                    onPressed: widget.onComment,
                    splashRadius: 22,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
