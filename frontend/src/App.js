import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          The Knowledge Bay
        </h1>
        <p className="text-gray-600 text-lg text-center mb-8">
          Compartiendo conocimiento
        </p>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
          Comenzar
        </button>
      </div>
    </div>
  );
}

export default App;
