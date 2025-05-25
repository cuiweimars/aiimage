// This file contains the database schema for Supabase
// You can use this as a reference when setting up your database tables

/*
Table: users
- id: uuid (primary key)
- name: text
- email: text (unique)
- password: text (hashed)
- image: text (nullable)
- bio: text (nullable)
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())

Table: images
- id: uuid (primary key)
- user_id: uuid (foreign key to users.id)
- prompt: text
- image_url: text
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())

Table: subscriptions
- id: uuid (primary key)
- user_id: uuid (foreign key to users.id)
- plan: text (e.g., 'basic', 'ultimate')
- status: text (e.g., 'active', 'canceled')
- current_period_end: timestamp with time zone
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
*/

// SQL to create these tables:
/*
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  image TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
