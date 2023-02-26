ALTER TABLE "users" ADD PRIMARY KEY (id);

CREATE TABLE "categories" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES "users"
);

CREATE TABLE "transactions" (
  id SERIAL PRIMARY KEY,
  ammount INTEGER NOT NULL,
  category_id INTEGER NOT NULL REFERENCES "categories",
  created_at TIMESTAMP DEFAULT NOW()
);
