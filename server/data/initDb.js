import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProducts = [
  { name: "Wheat floor 2kg", price: 186.0 },
  { name: "Maize floor 2kg", price: 140.0 },
  { name: "Rice 1kg", price: 190.0 },
  { name: "Cooking fat 1kg", price: 380.0 },
];

const seedDefaultProducts = async () => {
  await pool.query("BEGIN");

  try {
    await pool.query("DELETE FROM products");

    for (const product of seedProducts) {
      await pool.query(
        "INSERT INTO products (name, price) VALUES ($1, $2)",
        [product.name, product.price],
      );
    }

    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

export const initializeDatabase = async () => {
  const schemaPath = path.join(__dirname, "data.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");

  await pool.query(schemaSql);
  await seedDefaultProducts();
};
