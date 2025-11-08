import 'package:flutter/material.dart';
import '../components/post_card.dart';
import '../services/post_service.dart';
import 'create_post_screen.dart';
import '../utils/user_preferences.dart';

class SocialMediaPage extends StatefulWidget {
  const SocialMediaPage({Key? key}) : super(key: key);

  @override
  _SocialMediaPageState createState() => _SocialMediaPageState();
}

class _SocialMediaPageState extends State<SocialMediaPage> {
  List<Post> _posts = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final postsData = await PostService.getPosts();
      setState(() {
        _posts = postsData.map((data) => Post.fromJson(data)).toList();
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showComments(BuildContext context, Post post) async {
    List<Map<String, dynamic>> comments = [];
    bool loading = true;
    String? error;
    TextEditingController commentController = TextEditingController();
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            Future<void> fetchComments() async {
              setModalState(() {
                loading = true;
                error = null;
              });
              try {
                comments = await PostService.getComments(post.id);
              } catch (e) {
                error = e.toString();
              } finally {
                setModalState(() {
                  loading = false;
                });
              }
            }

            if (loading) fetchComments();
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: DraggableScrollableSheet(
                initialChildSize: 0.9,
                minChildSize: 0.5,
                maxChildSize: 0.9,
                expand: false,
                builder: (context, scrollController) => Column(
                  children: [
                    const SizedBox(height: 12),
                    const Text(
                      'Comments',
                      style: TextStyle(
                        fontSize: 20.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Expanded(
                      child: loading
                          ? const Center(child: CircularProgressIndicator())
                          : error != null
                          ? Center(child: Text('Error: ' + error!))
                          : comments.isEmpty
                          ? const Center(child: Text('No comments yet'))
                          : ListView.builder(
                              controller: scrollController,
                              itemCount: comments.length,
                              itemBuilder: (context, idx) {
                                final c = comments[idx];
                                return _buildCommentItem(
                                  c['authorAadhar'] ?? 'Anonymous',
                                  c['comment'] ?? '',
                                  '', // Optionally format time
                                  likes: c['likes'] ?? 0,
                                  commentId: c['id']?.toString(),
                                  onLike: () async {
                                    if (c['id'] != null) {
                                      final success =
                                          await PostService.likeComment(
                                            c['id'].toString(),
                                          );
                                      if (success) {
                                        await fetchComments();
                                      } else {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Failed to like comment.',
                                            ),
                                          ),
                                        );
                                      }
                                    }
                                  },
                                );
                              },
                            ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: commentController,
                              decoration: const InputDecoration(
                                hintText: 'Add a comment...',
                                border: OutlineInputBorder(),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () async {
                              final text = commentController.text.trim();
                              if (text.isNotEmpty) {
                                final aadhar =
                                    await UserPreferences.getAadharNumber();
                                if (aadhar == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Aadhar number not found. Please login.',
                                      ),
                                    ),
                                  );
                                  return;
                                }
                                final success = await PostService.createComment(
                                  comment: text,
                                  postId: post.id,
                                  authorAadhar: aadhar,
                                );
                                if (success) {
                                  commentController.clear();
                                  await fetchComments();
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Failed to add comment.'),
                                    ),
                                  );
                                }
                              }
                            },
                            child: const Text('Post'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildCommentItem(
    String authorAadhar,
    String content,
    String timeAgo, {
    int? likes,
    String? commentId,
    void Function()? onLike,
  }) {
    String displayAadhar = authorAadhar.length >= 4
        ? '*${authorAadhar.substring(authorAadhar.length - 4)}'
        : '*$authorAadhar';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                displayAadhar,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14.0,
                ),
              ),
              const SizedBox(width: 8.0),
              Text(
                timeAgo,
                style: TextStyle(color: Colors.grey[600], fontSize: 12.0),
              ),
            ],
          ),
          const SizedBox(height: 4.0),
          Text(content),
          const SizedBox(height: 8.0),
          Row(
            children: [
              IconButton(
                icon: const Icon(
                  Icons.thumb_up,
                  size: 18.0,
                  color: Colors.blue,
                ),
                onPressed: onLike,
                tooltip: 'Like',
              ),
              Text(
                likes?.toString() ?? '0',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TechTonic Social'),
        backgroundColor: Theme.of(context).primaryColor,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchPosts),
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: () {
              // TODO: Implement sort functionality
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: $_error'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _fetchPosts,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _posts.isEmpty
          ? const Center(child: Text('No posts yet'))
          : RefreshIndicator(
              onRefresh: _fetchPosts,
              child: ListView.builder(
                itemCount: _posts.length,
                itemBuilder: (context, index) {
                  return PostCard(
                    post: _posts[index],
                    onTap: () => _showComments(context, _posts[index]),
                    onComment: () => _showComments(context, _posts[index]),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreatePostScreen()),
          );
          if (result == true) {
            // Refresh posts after successful creation
            // TODO: Implement post refresh logic
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
