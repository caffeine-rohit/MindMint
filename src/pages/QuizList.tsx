import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import QuizCard from '../components/QuizCard';

interface Quiz {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  users: { name: string }[];
  questions: { id: string }[];
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [searchQuery, quizzes]);

        const fetchQuizzes = async () => {
        try {
            const { data, error } = await supabase
            .from('quizzes')
            .select(`
                id,
                title,
                description,
                creator_id,
                users!quizzes_creator_id_fkey (name),
                questions (id)
            `)
            .order('created_at', { ascending: false });

            // Debugging log
            console.log("Fetched quizzes:", data, error);


            if (error) throw error;
            setQuizzes(data as Quiz[]);
            setFilteredQuizzes(data as Quiz[]);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
        };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-2">All Quizzes</h1>
          <p className="text-slate-600 mb-6">Browse and take quizzes created by the community</p>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quizzes..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </motion.div>

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
        ) : filteredQuizzes.length > 0 ? (
          <>
            <div className="text-sm text-slate-600 mb-4">
              {searchQuery ? `Found ${filteredQuizzes.length} quiz(es)` : `${filteredQuizzes.length} total quiz(es)`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
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
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600 text-lg">
              {searchQuery ? 'No quizzes found matching your search.' : 'No quizzes available yet.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}