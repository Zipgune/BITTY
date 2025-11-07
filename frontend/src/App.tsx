import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Header from './components/Layout/Header';
import HomePage from './components/Home/HomePage';
import MemeEditor from './components/MemeEditor/MemeEditor';
import MemeLibrary from './components/Library/MemeLibrary';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'library' | 'profile'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <Login onToggleMode={() => setAuthMode('signup')} />
        ) : (
          <SignUp onToggleMode={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {currentView !== 'editor' && (
        <Header currentView={currentView} onNavigate={setCurrentView} />
      )}

      {currentView === 'home' && (
        <HomePage onCreateMeme={() => setCurrentView('editor')} />
      )}

      {currentView === 'editor' && (
        <MemeEditor onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'library' && (
        <MemeLibrary />
      )}

      {currentView === 'profile' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
            <p className="text-gray-600">Profile management coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
