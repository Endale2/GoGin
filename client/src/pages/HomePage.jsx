import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:8080/recipes', {
          withCredentials:true
         
        });

        setRecipes(response.data);
      } catch (err) {
        if (err.response.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          // Try refreshing the access token
          try {
            const refreshResponse = await axios.post('http://localhost:8080/refresh', {
              refreshToken,
            });

            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            fetchRecipes(); // Retry the original request
          } catch (refreshError) {
            setError('Session expired. Please log in again.');
          }
        } else {
          setError('Failed to fetch recipes. Please try again later.');
        }
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div>
      <h1>This is the homepage</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recipes.length === 0 ? (
        <p>No recipes available.</p>
      ) : (
        <ul>
          {recipes.map((recipe, index) => (
            <li key={index}>{recipe.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
