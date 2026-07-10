import { seedDatabase } from "../src/lib/db/seed";

const force = process.argv.includes("--force") || process.argv.includes("--reset");
const result = seedDatabase({ force });
console.log(result);
