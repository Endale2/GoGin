import React, { useEffect, useState } from 'react';
 // Assume axios is exported as axiosInstance

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/recipes/', {
          withCredentials: true
        });
        setRecipes(response.data);
      } catch (err) {
        setError('Failed to fetch recipes. Please try again later.');
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
            <li key={index}>{recipe.Title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
