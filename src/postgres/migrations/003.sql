/*
Add on delete constraints
*/
ALTER TABLE "categories"
DROP CONSTRAINT "categories_user_id_fkey",
ADD CONSTRAINT "categories_user_id_fkey"
  FOREIGN KEY (user_id)
  REFERENCES "users"(id)
  ON DELETE CASCADE;

ALTER TABLE "transactions"
DROP CONSTRAINT "transactions_category_id_fkey",
ADD CONSTRAINT "transactions_category_id_fkey"
  FOREIGN KEY (category_id)
  REFERENCES "categories"(id)
  ON DELETE CASCADE;
