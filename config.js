const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.OPENSOULS_DISCORD_FB_APIKEY,
  authDomain: `${process.env.OPENSOULS_DISCORD_FB_DOMAIN}.firebaseapp.com`,
  projectId: process.env.OPENSOULS_DISCORD_FB_DOMAIN,
  storageBucket: `${process.env.OPENSOULS_DISCORD_FB_DOMAIN}.appspot.com`,
  messagingSenderId: process.env.OPENSOULS_DISCORD_FB_SENDERID,
  appId: process.env.OPENSOULS_DISCORD_FB_APPID,
  measurementId: process.env.OPENSOULS_DISCORD_FB_MEASID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = {
  OPENAI_API_KEY,
  FS_APP: app,
  FS_DB: db
};