import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, signOut } = useAuth();

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-emerald-600">MindMint</span>
              <span className="text-2xl">🌿</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-slate-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/quizzes"
                className="text-slate-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Browse Quizzes
              </Link>
              {user && (
                <Link
                  to="/create"
                  className="text-slate-700 hover:text-emerald-600 transition-colors font-medium"
                >
                  Create Quiz
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-slate-600 text-sm">
                    Welcome, <span className="font-semibold text-slate-800">{user.user_metadata?.name || user.email}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-emerald-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/quizzes"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors font-medium"
              >
                Browse Quizzes
              </Link>
              {user && (
                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors font-medium"
                >
                  Create Quiz
                </Link>
              )}

              {user ? (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="px-4 py-2 text-sm text-slate-600">
                    Welcome, <span className="font-semibold text-slate-800">{user.user_metadata?.name || user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="w-full px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        />
      )}
    </>
  );
}
