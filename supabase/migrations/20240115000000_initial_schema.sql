-- Create users table (acting as profile)
-- Note: password_hash is handled by Supabase Auth, so we don't store it here.
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Words table
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    english_word VARCHAR(100) NOT NULL,
    chinese_meaning VARCHAR(255) NOT NULL,
    example_sentence TEXT,
    phonetic_symbol VARCHAR(100),
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day'
);

CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_created_at ON words(created_at DESC);
CREATE INDEX idx_words_review_date ON words(review_date);

-- Reading records table
CREATE TABLE reading_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    article_title VARCHAR(255) NOT NULL,
    article_content TEXT NOT NULL,
    reading_notes TEXT,
    reading_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reading_user_id ON reading_records(user_id);
CREATE INDEX idx_reading_created_at ON reading_records(created_at DESC);

-- Quiz scores table
CREATE TABLE quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_user_id ON quiz_scores(user_id);
CREATE INDEX idx_quiz_created_at ON quiz_scores(created_at DESC);

-- Learning notes table
CREATE TABLE learning_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON learning_notes(user_id);
CREATE INDEX idx_notes_created_at ON learning_notes(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own words" ON words
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reading records" ON reading_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz scores" ON quiz_scores
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own learning notes" ON learning_notes
    FOR ALL USING (auth.uid() = user_id);

-- Permissions for authenticated users
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON words TO authenticated;
GRANT ALL PRIVILEGES ON reading_records TO authenticated;
GRANT ALL PRIVILEGES ON quiz_scores TO authenticated;
GRANT ALL PRIVILEGES ON learning_notes TO authenticated;

-- Permissions for anon users (optional, usually none or read-only public data)
-- GRANT SELECT ON users TO anon; 
