-- Setup of Categories Database

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL
  -- tag, what ever wolfram calls it, then we can categorize it, title VARCHAR(255) NOT NULL
);
