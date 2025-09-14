const mongoose = require("mongoose");
require("dotenv").config();

const Skill = require("../models/skillsSchema"); // adjust path

// Array of IT skills
const skills = [
  "JavaScript",
  "Node.js",
  "MongoDB",
  "Express.js",
  "React",
  "Angular",
  "Vue.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET Core",
  "PHP",
  "Laravel",
  "MySQL",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "HTML5",
  "CSS3",
  "TypeScript",
  "GraphQL",
  "Redis",
  "RabbitMQ",
  "Jenkins",
];

async function seedSkills() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Avoid duplicates
    for (const skill of skills) {
      const exists = await Skill.findOne({ name: skill });
      if (!exists) {
        await Skill.create({ name: skill });
        console.log(`Added skill: ${skill}`);
      } else {
        console.log(`Skill already exists: ${skill}`);
      }
    }

    console.log("Skill seeding completed");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding skills:", error);
    mongoose.disconnect();
  }
}

// Run the seeder
seedSkills();
