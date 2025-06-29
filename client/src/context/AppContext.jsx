import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AppContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_QUESTIONS: 'SET_QUESTIONS',
  SET_ANSWERS: 'SET_ANSWERS',
  UPDATE_QUESTION: 'UPDATE_QUESTION',
  UPDATE_ANSWER: 'UPDATE_ANSWER',
  UPDATE_REPLY: 'UPDATE_REPLY',
  ADD_QUESTION: 'ADD_QUESTION',
  ADD_ANSWER: 'ADD_ANSWER',
  ADD_REPLY: 'ADD_REPLY',
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH: 'SET_SEARCH',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  questions: [],
  answers: {},
  filters: {
    course: '',
    university: '',
    department: '',
    type: 'question'
  },
  searchQuery: '',
  user: null
};

// Reducer function
function appReducer(state, action) {
  console.log('AppContext Reducer:', action.type, action.payload);
  
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ACTIONS.SET_QUESTIONS:
      console.log('Setting questions:', action.payload?.length || 0, 'questions');
      return { ...state, questions: action.payload, loading: false };
    
    case ACTIONS.SET_ANSWERS:
      return { 
        ...state, 
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answers },
        loading: false 
      };
    
    case ACTIONS.UPDATE_QUESTION:
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
        )
      };
    
    case ACTIONS.UPDATE_ANSWER:
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: state.answers[action.payload.questionId]?.map(a =>
            a.id === action.payload.answerId ? { ...a, ...action.payload.updates } : a
          ) || []
        }
      };
    
    case ACTIONS.UPDATE_REPLY:
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: state.answers[action.payload.questionId]?.map(a => {
            if (a.id === action.payload.answerId) {
              return {
                ...a,
                replies: a.replies?.map(r =>
                  r.id === action.payload.replyId ? { ...r, ...action.payload.updates } : r
                ) || []
              };
            }
            return a;
          }) || []
        }
      };
    
    case ACTIONS.ADD_QUESTION:
      return {
        ...state,
        questions: [action.payload, ...state.questions]
      };
    
    case ACTIONS.ADD_ANSWER:
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: [
            ...(state.answers[action.payload.questionId] || []),
            action.payload.answer
          ]
        }
      };
    
    case ACTIONS.ADD_REPLY:
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: state.answers[action.payload.questionId]?.map(a => {
            if (a.id === action.payload.answerId) {
              return {
                ...a,
                replies: [...(a.replies || []), action.payload.reply]
              };
            }
            return a;
          }) || []
        }
      };
    
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ACTIONS.SET_SEARCH:
      return { ...state, searchQuery: action.payload };
    
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // API functions
  const api = {
    // Posts (previously questions)
    fetchQuestions: async (filters = {}) => {
      try {
        console.log('=== API: Fetching posts ===');
        console.log('Filters:', filters);
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.type) params.append('type', filters.type);

        const url = `/posts?${params.toString()}`;
        console.log('API URL:', url);
        
        const response = await axiosInstance.get(url);
        console.log('API Response:', {
          status: response.status,
          dataLength: response.data?.length || 0,
          data: response.data
        });
        
        dispatch({ type: ACTIONS.SET_QUESTIONS, payload: response.data });
      } catch (error) {
        console.error('=== API: Error fetching posts ===');
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      }
    },

    fetchAnswers: async (questionId) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        const response = await axiosInstance.get(`/posts/${questionId}/comments`);
        dispatch({ 
          type: ACTIONS.SET_ANSWERS, 
          payload: { questionId, answers: response.data } 
        });
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      }
    },

    createQuestion: async (questionData) => {
      try {
        const response = await axiosInstance.post('/posts', questionData);
        dispatch({ type: ACTIONS.ADD_QUESTION, payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createAnswer: async (answerData) => {
      try {
        const response = await axiosInstance.post('/comments', answerData);
        dispatch({ 
          type: ACTIONS.ADD_ANSWER, 
          payload: { 
            questionId: answerData.post_id, 
            answer: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createReply: async (replyData) => {
      try {
        const response = await axiosInstance.post('/comments', replyData);
        dispatch({ 
          type: ACTIONS.ADD_REPLY, 
          payload: { 
            questionId: replyData.post_id, 
            answerId: replyData.parent_id, 
            reply: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Like/Dislike/Save functions
    likeQuestion: async (questionId) => {
      try {
        const response = await axiosInstance.post(`/posts/${questionId}/upvote`);
        dispatch({ 
          type: ACTIONS.UPDATE_QUESTION, 
          payload: { 
            id: questionId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    dislikeQuestion: async (questionId) => {
      try {
        const response = await axiosInstance.post(`/posts/${questionId}/downvote`);
        dispatch({ 
          type: ACTIONS.UPDATE_QUESTION, 
          payload: { 
            id: questionId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    saveQuestion: async (questionId) => {
      try {
        const response = await axiosInstance.post(`/posts/${questionId}/save`);
        dispatch({ 
          type: ACTIONS.UPDATE_QUESTION, 
          payload: { 
            id: questionId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    unsaveQuestion: async (questionId) => {
      try {
        const response = await axiosInstance.delete(`/posts/${questionId}/save`);
        dispatch({ 
          type: ACTIONS.UPDATE_QUESTION, 
          payload: { 
            id: questionId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    likeAnswer: async (answerId, questionId) => {
      try {
        const response = await axiosInstance.post(`/comments/${answerId}/upvote`);
        dispatch({ 
          type: ACTIONS.UPDATE_ANSWER, 
          payload: { 
            questionId, 
            answerId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    dislikeAnswer: async (answerId, questionId) => {
      try {
        const response = await axiosInstance.post(`/comments/${answerId}/downvote`);
        dispatch({ 
          type: ACTIONS.UPDATE_ANSWER, 
          payload: { 
            questionId, 
            answerId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    likeReply: async (replyId, answerId, questionId) => {
      try {
        const response = await axiosInstance.post(`/comments/${replyId}/upvote`);
        dispatch({ 
          type: ACTIONS.UPDATE_REPLY, 
          payload: { 
            questionId, 
            answerId, 
            replyId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    dislikeReply: async (replyId, answerId, questionId) => {
      try {
        const response = await axiosInstance.post(`/comments/${replyId}/downvote`);
        dispatch({ 
          type: ACTIONS.UPDATE_REPLY, 
          payload: { 
            questionId, 
            answerId, 
            replyId, 
            updates: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    }
  };

  const value = {
    ...state,
    dispatch,
    api,
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
    setFilters: (filters) => dispatch({ type: ACTIONS.SET_FILTERS, payload: filters }),
    setSearch: (query) => dispatch({ type: ACTIONS.SET_SEARCH, payload: query })
  };

  console.log('AppContext State:', {
    loading: state.loading,
    error: state.error,
    questionsCount: state.questions?.length || 0,
    filters: state.filters,
    searchQuery: state.searchQuery
  });

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 