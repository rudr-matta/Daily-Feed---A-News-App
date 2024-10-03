const express = require('express');
const fs = require('fs');
const twilio = require('twilio');
const cron = require('node-cron');
const path = require('path');
const axios = require('axios');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const accountSid = 'AC4af1c573de27de84efb414e899efbd1a';
const authToken = '9513ce5768f90dd18aaf31deabe71041';

const client = twilio(accountSid, authToken);

async function fetchNews() {
  try {
    const resp = await axios.get(`https://newsapi.org/v2/everything?q=india&apiKey=5b3453f311b54e1484b222d06a6c80fe`);
    const data = resp.data.articles
    // console.log(data[0]);
    const news =  data.slice(7, 10); // Extract top 3 news articles
    // console.log(news);
    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return []; // Return an empty array if fetching fails
  }
}

// fetchNews();

async function formatNewsAndSendWhatsApp() {
  try {
    const news = await fetchNews();
    const formattedNews = news.map(article => `${article.title}\n${article.url}`).join('\n\n'); // Format news as title and URL
    await client.messages.create({
      body: formattedNews,
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919315623444'
    });
    console.log('News sent successfully:', formattedNews);
  } catch (error) {
    console.error('Error sending news via WhatsApp:', error);
  }
}
// formatNewsAndSendWhatsApp();
// Schedule the task to run every day at 8 am
cron.schedule('* * * * *', formatNewsAndSendWhatsApp);

app.listen(3000, () => console.log('Server is running on port 3000'));
