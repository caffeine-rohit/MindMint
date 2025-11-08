/*
  # MindMint Quiz Application Schema

  ## Overview
  This migration creates the complete database schema for MindMint, a modern quiz platform.
  It includes tables for user users, quizzes, questions, and results tracking.

  ## New Tables
  
  ### 1. `users`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, not null) - User's email address
  - `name` (text) - User's display name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. `quizzes`
  - `id` (uuid, primary key) - Unique quiz identifier
  - `title` (text, not null) - Quiz title
  - `description` (text) - Quiz description
  - `creator_id` (uuid, not null) - References users.id
  - `created_at` (timestamptz) - Quiz creation timestamp
  
  ### 3. `questions`
  - `id` (uuid, primary key) - Unique question identifier
  - `quiz_id` (uuid, not null) - References quizzes.id
  - `question_text` (text, not null) - The question content
  - `options` (jsonb, not null) - Array of 4 answer options
  - `correct_answer` (text, not null) - The correct answer (A, B, C, or D)
  - `order_index` (integer, not null) - Question order in quiz
  - `created_at` (timestamptz) - Question creation timestamp
  
  ### 4. `results`
  - `id` (uuid, primary key) - Unique result identifier
  - `quiz_id` (uuid, not null) - References quizzes.id
  - `user_id` (uuid, not null) - References users.id
  - `score` (integer, not null) - Number of correct answers
  - `total_questions` (integer, not null) - Total questions in quiz
  - `answers` (jsonb, not null) - User's answers with correctness
  - `created_at` (timestamptz) - Result submission timestamp

  ## Security
  
  1. Row Level Security (RLS) enabled on all tables
  2. users:
     - Users can read all users
     - Users can update only their own profile
  3. Quizzes:
     - Everyone can read all quizzes
     - Only authenticated users can create quizzes
     - Only creators can update/delete their quizzes
  4. Questions:
     - Everyone can read questions
     - Only quiz creators can manage questions
  5. Results:
     - Users can read their own results
     - Users can create results for any quiz
     - No updates or deletes allowed

  ## Indexes
  - Quiz lookups by creator
  - Questions by quiz
  - Results by user and quiz
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Quiz creators can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Quiz creators can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Quiz creators can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.creator_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own results"
  ON results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create results"
  ON results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_quiz_id ON results(quiz_id);