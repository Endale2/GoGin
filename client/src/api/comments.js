const API_BASE = 'http://localhost:8080';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const commentsAPI = {
  async getComments(postId) {
    const response = await fetch(`${API_BASE}/comments/post/${postId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    
    return response.json();
  },

  async createComment(postId, commentData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments/post/${postId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify(commentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create comment');
    }
    
    return response.json();
  },

  async updateComment(commentId, commentData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify(commentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update comment');
    }
    
    return response.json();
  },

  async deleteComment(commentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete comment');
    }
    
    return response.json();
  },

  async voteComment(commentId, voteType) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments/${commentId}/${voteType}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to vote on comment');
    }
    
    return response.json();
  },
}; 