const API_BASE = 'http://localhost:8080';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const postsAPI = {
  async getPosts(sort = 'new', search = '') {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE}/posts/?${params.toString()}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch posts');
    }
    
    return response.json();
  },

  async filterPosts(filters = {}) {
    const response = await fetch(`${API_BASE}/posts/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(filters),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to filter posts');
    }
    
    return response.json();
  },

  async getPost(id) {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch post');
    }
    
    return response.json();
  },

  async createPost(postData, token) {
    const response = await fetch(`${API_BASE}/posts/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create post');
    }
    
    return response.json();
  },

  async updatePost(id, postData, token) {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update post');
    }
    
    return response.json();
  },

  async deletePost(id, token) {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete post');
    }
    
    return response.json();
  },

  async votePost(id, voteType) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/posts/${id}/${voteType}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to vote on post');
    }
    
    return response.json();
  },

  async savePost(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/posts/${id}/save`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to save post');
    }
    
    return response.json();
  },

  async unsavePost(id) {
    const token = localStorage.getItem('token');
    // Backend expects DELETE /posts/:id/save to unsave
    const response = await fetch(`${API_BASE}/posts/${id}/save`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to unsave post');
    }
    
    return response.json();
  },
}; 