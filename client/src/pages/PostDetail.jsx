import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postsAPI } from '../api/posts';
import { commentsAPI } from '../api/comments';
import { FiArrowLeft, FiThumbsUp, FiThumbsDown, FiMessageCircle, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { InteractionBar } from '../components/InteractionButtons';
import RealTimeComment from '../components/RealTimeComment';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendTyping, sendStopTyping, typingUsers } = useWebSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          postsAPI.getPost(id),
          commentsAPI.getComments(id)
        ]);
        setPost(postData);
        setComments(commentsData || []); // Ensure comments is always an array
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Listen for real-time comment updates
  useEffect(() => {
    const handleNewComment = (event) => {
      const { comment, post_id } = event.detail;
      if (post_id === id) {
        setComments(prev => [comment, ...(prev || [])]);
      }
    };

    window.addEventListener('newComment', handleNewComment);
    return () => window.removeEventListener('newComment', handleNewComment);
  }, [id]);

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleVote = async (voteType) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      await postsAPI.votePost(id, voteType);
      // Refresh post data to get updated vote counts
      const updatedPost = await postsAPI.getPost(id);
      setPost(updatedPost);
    } catch (error) {
      console.error('Error voting on post:', error);
      setError('Failed to vote. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Please log in to save posts');
      return;
    }

    try {
      await postsAPI.savePost(id);
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Failed to save post. Please try again.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      setError('Please log in to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const comment = await commentsAPI.createComment(id, { content: newComment });
      setComments(prev => [comment, ...(prev || [])]);
      setNewComment('');
      sendStopTyping(id);
    } catch (error) {
      console.error('Error creating comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTyping = () => {
    sendTyping(id);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Post not found</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Ensure comments is always an array
  const safeComments = comments || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to posts</span>
        </Link>
      </div>

      {/* Post */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          {/* Vote Column */}
          <div className="flex flex-col items-center space-y-2">
            <button 
              onClick={() => handleVote('upvote')}
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              <FiThumbsUp className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-900">{post.score || 0}</span>
            <button 
              onClick={() => handleVote('downvote')}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiThumbsDown className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-500">Posted by</span>
              <span className="text-sm font-medium text-blue-600">{post.author?.email || 'Anonymous'}</span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <FiClock className="w-3 h-3" />
                <span>{formatTime(post.created_at || post.CreatedAt)}</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {/* Tags - Fixed null check */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Real-time Interaction Bar */}
            <InteractionBar
              id={post.id || post.ID}
              likesCount={post.upvotes || 0}
              dislikesCount={post.downvotes || 0}
              commentsCount={safeComments.length}
              onLike={() => handleVote('upvote')}
              onDislike={() => handleVote('downvote')}
              onSave={handleSave}
              size="lg"
              showSave={true}
              showComments={false}
            />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Comments ({safeComments.length})
        </h2>

        {/* New Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                handleTyping();
              }}
              onBlur={() => sendStopTyping(id)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-500">
                {typingUsers && Object.keys(typingUsers).length > 0 && (
                  <span>{Object.values(typingUsers).join(', ')} is typing...</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to comment.</p>
          </div>
        )}

        {/* Comments List */}
        {safeComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeComments.map((comment) => (
              <RealTimeComment
                key={comment._id}
                comment={comment}
                postId={id}
                onCommentUpdate={() => {
                  // Refresh comments if needed
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail; 