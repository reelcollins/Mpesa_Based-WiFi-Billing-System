const bcrypt = require("bcryptjs");
const db = require("../config/db");

const email = "admin@example.com";  // Change this
const password = "admin100"; // Change this

async function createAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("Generated Hashed Password:", hashedPassword); // Debugging log

        db.query("INSERT INTO admins (email, password) VALUES (?, ?)", [email, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error inserting admin:", err);
            } else {
                console.log("Admin added successfully!");
            }
            process.exit();
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        process.exit(1);
    }
}

createAdmin();
