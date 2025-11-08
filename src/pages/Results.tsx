import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Answer {
  question_id: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

interface Result {
  id: string;
  score: number;
  total_questions: number;
  answers: Answer[];
  created_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/quizzes');
      return;
    }
    if (id) {
      fetchResults();
    }
  }, [id, user]);

  const fetchResults = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, description')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .select('*')
        .eq('quiz_id', id)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (resultError) throw resultError;
      setResult(resultData);
    } catch (error) {
      console.error('Error fetching results:', error);
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Results not found</p>
        </div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total_questions) * 100);
  const getLetterFromIndex = (index: number) => ['A', 'B', 'C', 'D'][index] || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Quiz Complete!</h1>
            <p className="text-slate-600">{quiz.title}</p>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 mb-6">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-emerald-600">{percentage}%</div>
                <div className="text-sm text-slate-600 mt-1">
                  {result.score}/{result.total_questions}
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {percentage >= 80
                  ? 'Excellent Work!'
                  : percentage >= 60
                  ? 'Good Job!'
                  : percentage >= 40
                  ? 'Keep Practicing!'
                  : 'Nice Try!'}
              </h2>
              <p className="text-slate-600">
                You answered {result.score} out of {result.total_questions} questions correctly
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/quiz/${id}`}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake Quiz</span>
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Answer Review</h2>

          <div className="space-y-6">
            {result.answers.map((answer, index) => (
              <div
                key={answer.question_id}
                className={`p-6 rounded-xl border-2 ${
                  answer.is_correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 flex-1">
                    {index + 1}. {answer.question_text}
                  </h3>
                  {answer.is_correct ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-slate-700 w-32">Your Answer:</span>
                    <span
                      className={`font-semibold ${
                        answer.is_correct ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {answer.user_answer || 'Not answered'}
                    </span>
                  </div>
                  {!answer.is_correct && (
                    <div className="flex items-center">
                      <span className="font-medium text-slate-700 w-32">Correct Answer:</span>
                      <span className="font-semibold text-green-700">
                        {answer.correct_answer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}