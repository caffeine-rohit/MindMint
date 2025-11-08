import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, PlusCircle, Library } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import QuizCard from '../components/QuizCard';
import { useAuth } from '../context/AuthContext';

interface Quiz {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  users: { name: string }[];
  questions: { id: string }[];
}

export default function Home() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLatestQuizzes();
  }, []);

  const fetchLatestQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          creator_id,
          users (name),
          questions (id)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setQuizzes(data as Quiz[]);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 p-4 rounded-full">
                <Brain className="w-12 h-12 text-emerald-600" />
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Create, Take, and Master<br />Quizzes with MindMint
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A smarter way to learn and challenge your mind.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? "/create" : "/quizzes"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    alert('Please sign in to create quizzes');
                  }
                }}
                className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create a Quiz</span>
              </Link>

              <Link
                to="/quizzes"
                className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-emerald-600 font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl border border-emerald-200"
              >
                <Library className="w-5 h-5" />
                <span>Take a Quiz</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Latest Quizzes</h2>
            <p className="text-slate-600">Explore and challenge yourself with these quizzes</p>
          </div>
          <Link
            to="/quizzes"
            className="hidden sm:inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4" />
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                id={quiz.id}
                title={quiz.title}
                description={quiz.description}
                creatorName={quiz.users?.[0]?.name || "Anonymous"}
                questionCount={quiz.questions?.length || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-4">No quizzes yet. Be the first to create one!</p>
            <Link
              to="/create"
              className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Quiz</span>
            </Link>
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link
            to="/quizzes"
            className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <span>View All Quizzes</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-600 text-sm">
            © 2025 MindMint. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
