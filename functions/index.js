// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const bucket = admin.storage().bucket("apprenticewatch-55cb9.firebasestorage.app");

exports.serveSitemap = functions.https.onRequest(async (req, res) => {
  console.log("Function serveSitemap started"); // ADDED LOG
  try {
    const file = bucket.file("sitemap.xml");
    console.log("Checking for file:", file.name); // ADDED LOG
    const [exists] = await file.exists();
    console.log("File exists:", exists); // ADDED LOG

    if (!exists) {
      console.log("Sitemap file not found in Storage"); // ADDED LOG
      res.status(404).send("Sitemap not found");
      return;
    }

    const [xmlContent] = await file.download();
    console.log("Sitemap file downloaded from Storage"); // ADDED LOG
    res.type("application/xml").send(xmlContent.toString());
  } catch (error) {
    console.error("Error serving sitemap:", error);
    res.status(500).send("Internal Server Error");
  }
  console.log("Function serveSitemap finished"); // ADDED LOG
});