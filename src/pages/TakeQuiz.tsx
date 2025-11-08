import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
}

export default function TakeQuiz() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchQuizData();
    }
  }, [id]);

  const fetchQuizData = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, description')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to submit your answers');
      return;
    }

    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have only answered ${answeredCount} out of ${questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);

    try {
      let score = 0;
      const answersDetail = questions.map((q) => {
        const userAnswer = userAnswers[q.id] || '';
        const isCorrect = userAnswer === q.correct_answer;
        if (isCorrect) score++;

        return {
          question_id: q.id,
          question_text: q.question_text,
          user_answer: userAnswer,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
        };
      });

      const { error } = await supabase.from('results').insert({
        quiz_id: id,
        user_id: user.id,
        score,
        total_questions: questions.length,
        answers: answersDetail,
      });

      if (error) throw error;

      navigate(`/results/${id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Quiz not found</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{quiz.title}</h1>
            <p className="text-slate-600">{quiz.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Object.keys(userAnswers).length} answered</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((letter, index) => (
                <button
                  key={letter}
                  onClick={() => handleAnswerSelect(letter)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === letter
                      ? 'border-emerald-600 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 ${
                        selectedAnswer === letter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-slate-700">{currentQuestion.options[index]}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
