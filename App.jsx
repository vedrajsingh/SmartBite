import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import { fetchRecipes } from './services/gemini';
import { Sparkles, Loader2, X, Clock } from 'lucide-react';

const MOODS = {
  'Comfort': '#FFF3E0',
  'Healthy': '#E8F5E9',
  'Lazy': '#F0F4F8',
  'Chef Mode': '#FFFBF5'
};

const App = () => {
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [mood, setMood] = useState('Comfort');
  const [time, setTime] = useState('<30 mins');
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      document.body.style.backgroundColor = MOODS[mood];
    } else {
      document.body.style.backgroundColor = '#FFFBF5'; // default background for login
    }
  }, [mood, isLoggedIn]);

  const handleAddIngredient = (e) => {
    if (e.key === 'Enter' && ingredientInput.trim()) {
      e.preventDefault();
      if (!ingredients.includes(ingredientInput.trim())) {
        setIngredients([...ingredients, ingredientInput.trim()]);
      }
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingToRemove) => {
    setIngredients(ingredients.filter(ing => ing !== ingToRemove));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      alert("Please add some ingredients first!");
      return;
    }

    const illegalWords = ['stone', 'shoe', 'plastic', 'wood', 'metal'];
    const hasIllegal = ingredients.some(ing => 
      illegalWords.some(word => ing.toLowerCase().includes(word))
    );

    if (hasIllegal) {
      alert('Illegal ingredients detected! Please enter real food.');
      return;
    }

    setLoading(true);
    try {
      const results = await fetchRecipes(ingredients.join(', '), mood, time);
      if (results?.error) {
        alert(results.error);
        setRecipes([]);
      } else {
        setRecipes(results || []);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate recipes.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 text-textMain transition-colors duration-700">
        <div className="bg-white/30 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-md border border-white/50 text-center mx-4">
          <h2 className="text-4xl font-extrabold mb-4 text-textMain tracking-tight">Welcome to Smart<span className="text-accent">Bite</span></h2>
          <p className="text-textMain/80 mb-8 font-medium">Your personal AI chef. Let's create something delicious.</p>
          <button 
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-[#FF8A65] text-white font-bold text-lg rounded-xl hover:bg-[#F07A55] hover:shadow-xl transition-all duration-300 py-3 animate-pulse hover:animate-none"
          >
            Start Cooking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-textMain transition-colors duration-700 ease-in-out selection:bg-accent selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-textMain">
            The Intelligent <span className="text-accent">Pantry</span> Manager
          </h2>
          <p className="text-textMain/70 max-w-2xl mx-auto text-lg mb-10 font-medium">
            Tell the AI what's in your fridge. Choose your mood. We handle the rest. No more food waste, no more decision fatigue.
          </p>

          <div className="glass-panel p-8 rounded-3xl mx-auto max-w-3xl border border-white/60">
            <div className="mb-6">
              <label className="block text-left text-sm font-bold mb-2 ml-1 text-textMain/80 uppercase tracking-wider">What do you have?</label>
              <div className="bg-surface rounded-2xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-accent/50 transition-all shadow-inner">
                {ingredients.map(ing => (
                  <span key={ing} className="bg-background text-textMain px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 border border-gray-200 shadow-sm animate-in zoom-in duration-200 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" onClick={() => removeIngredient(ing)}>
                    {ing} <X size={14} />
                  </span>
                ))}
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={handleAddIngredient}
                  placeholder={ingredients.length === 0 ? "Type an ingredient and press Enter..." : "Add more..."}
                  className="flex-1 bg-transparent min-w-[200px] outline-none text-textMain font-medium placeholder:text-gray-400 py-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div>
                <label className="block text-sm font-bold mb-2 ml-1 text-textMain/80 uppercase tracking-wider">Mood</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(MOODS).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${mood === m ? 'bg-textMain text-white shadow-md' : 'bg-surface hover:bg-gray-50 border border-gray-200 text-textMain'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ml-1 text-textMain/80 uppercase tracking-wider">Time Limit</label>
                <div className="flex gap-2 flex-wrap">
                  {['<15 mins', '<30 mins', '<60 mins'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${time === t ? 'bg-textMain text-white shadow-md' : 'bg-surface hover:bg-gray-50 border border-gray-200 text-textMain'}`}
                    >
                      <Clock size={14} /> {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || ingredients.length === 0}
              className="w-full bg-accent text-white font-bold text-lg rounded-2xl hover:bg-[#F07A55] hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={24} /> Chef is thinking...</>
              ) : (
                <><Sparkles size={24} /> Generate Recipes</>
              )}
            </button>
          </div>
        </section>

        {/* Results Grid */}
        {recipes.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
            <div className="flex items-center justify-center mb-10">
              <h3 className="text-3xl font-extrabold tracking-tight">Your Smart Suggestions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index} 
                  recipe={recipe} 
                  onView={() => setSelectedRecipe(recipe)} 
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <RecipeModal 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
    </div>
  );
};

export default App;
