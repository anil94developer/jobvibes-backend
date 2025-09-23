const axios = require("axios");

// Bearer token
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGNhZmEzYTk3ODZiNDQzZTI0ODAwYjEiLCJzaWQiOiI2OGQxODBhZTkxNzdhMjYxNDVkNTc4ZDYiLCJpYXQiOjE3NTg1NjA0MzAsImV4cCI6MTc2MTE1MjQzMH0.QUdgxLxfrPvpCrSkDIsPW7kpkPCfZmtUay4QiW8tPrk";

// API URL
const API_URL = "http://localhost:3000/api/v1/feed/post";

// Media URLs from your uploaded files
const mediaUrls = [
  "https://res.cloudinary.com/dhhuke1d7/video/upload/v1758560271/mmgp4hjmz8ryfzzfd5rm.mp4",
  "https://res.cloudinary.com/dhhuke1d7/video/upload/v1758560279/cm38tn2tsx95n3cmci9o.mp4",
  "https://res.cloudinary.com/dhhuke1d7/video/upload/v1758560270/ynhrsybzuxmw1vb5q4m1.mp4",
  "https://res.cloudinary.com/dhhuke1d7/video/upload/v1758560275/sdlfglo5xysocwguyzux.mp4",
  "https://res.cloudinary.com/dhhuke1d7/video/upload/v1758560270/h6rasimjpjcfxwcpmfsx.mp4",
];

// Generate 20 different data payloads
const generatePosts = () => {
  const jobTitles = [
    "HR",
    "Software Engineer",
    "Data Scientist",
    "Designer",
    "Marketing",
  ];
  const jobTypes = [
    ["Full-time"],
    ["Part-time"],
    ["Remote"],
    ["Contract"],
    ["Internship"],
  ];
  const cities = [
    ["Bengaluru"],
    ["Hyderabad"],
    ["Delhi"],
    ["Mumbai"],
    ["Chennai"],
  ];
  const contents = [
    "Looking for opportunities in AI/ML.",
    "Excited to explore new design challenges.",
    "Open to data-driven product roles.",
    "Seeking growth in software engineering.",
    "Available for creative remote projects.",
  ];

  let posts = [];

  for (let i = 0; i < 20; i++) {
    posts.push({
      content: contents[i % contents.length],
      media: [mediaUrls[i % mediaUrls.length]], // rotate media URLs
      job_title: [jobTitles[i % jobTitles.length]],
      job_type: jobTypes[i % jobTypes.length],
      work_place_name: ["hybrid"],
      cities: cities[i % cities.length],
      notice_period: i % 3, // varies between 0,1,2
      is_immediate_joiner: i % 2 === 0,
    });
  }

  return posts;
};

// Function to call API for each post
const createPosts = async () => {
  const posts = generatePosts();

  for (let i = 0; i < posts.length; i++) {
    try {
      const response = await axios.post(API_URL, posts[i], {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      console.log(`Post ${i + 1} created:`, response.data.message);
    } catch (error) {
      console.error(
        `Error creating post ${i + 1}:`,
        error.response?.data || error.message
      );
    }
  }
};

// Run the function
createPosts();
