import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User } from 'lucide-react';

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  creatorName?: string;
  questionCount?: number;
}

export default function QuizCard({ id, title, description, creatorName, questionCount }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100"
    >
      <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{description}</p>

      <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
        {creatorName && (
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{creatorName}</span>
          </div>
        )}
        {questionCount !== undefined && (
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3 h-3" />
            <span>{questionCount} questions</span>
          </div>
        )}
      </div>

      <Link
        to={`/quiz/${id}`}
        className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-colors"
      >
        Take Quiz
      </Link>
    </motion.div>
  );
}