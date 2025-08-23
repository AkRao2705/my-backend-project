const bcrypt = require("bcryptjs");

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("Hashed password:", hash);
}

const password = "YourAdminPassword123"; // replace with your chosen password
generateHash(password);
