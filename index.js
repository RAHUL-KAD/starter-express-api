const express = require('express');
const app = express();
const geoip = require('geoip-lite');
const { createClient } = require('@supabase/supabase-js');
const base64 = require('base64-js');
const { DateTime } = require('luxon');
const SUPABASE_URL = 'https://xwskviprdexmphfivdtm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_TABLE = 'pixel-tracker';
const SUPABASE_USERS_TABLE = 'clerk-users';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// https://chat.openai.com/share/cb17d8b3-4b72-418f-b7a1-1f12a1898e43

// https://chat.openai.com/share/832e1170-e46a-4148-8556-b6787a3289c5

app.get('/', (req, res) => {
  res.send('Hello from tinypixel!');
});

app.get('/status', (req, res) => {
  res.send('ok!');
});

function extractUniqueUserId(user_id) {
  return supabase
    .from(SUPABASE_USERS_TABLE)
    .select('unique_user_id')
    .then(({ data }) => {
      console.log(data);

      // Check if error occurred while retrieving data
      if (data === null) {
        console.log('Error occurred while retrieving data.');
        return null;
      }

      // Equivalent for SQL Query "SELECT * FROM games;"
      console.log(data);
      for (const item of data) {
        if ('unique_user_id' in item && item['unique_user_id'] === user_id) {
          console.log('unique user id exists');
          return true;
        }
      }
      console.log('unique user id does not exist');
      return false;
    })
    .catch((error) => {
      console.error('An error occurred:', error);
      return null;
    });
}

app.get('/pixel.gif', async (req, res) => {
  const origin_page = req.query.page || 'main';
  const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const referrer = req.headers.referer || '';
  const geo_data = getGeoData(client_ip);
  const user_agent = req.headers['user-agent'] || '';
  const device_type = getDeviceType(user_agent);
  let user_id = '';

  for (const [key, value] of Object.entries(req.query)) {
    console.log(`${key}: ${value}`);
  }

  if ('user-id' in req.query) {
    user_id = req.query['user-id'];

    // checking if user id exists or not in Supabase and then only we will add other details
    const check_user_id = await extractUniqueUserId(user_id);
    if (check_user_id) {
      // visitor IP
      // (Rest of the code remains the same)
      console.log("user id is verified");
    } else {
      user_id = "User id doesn't exist";
    }
  }

  const pixel_data = base64.toByteArray('R0lGODlhAQABAIAAAP8AAP8AACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  const st = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
  const ist_now = DateTime.now().setZone('Asia/Kolkata').toFormat('yyyy-MM-dd HH:mm:ss.SSS');
  const id = Math.floor(Math.random() * 2000000) + 100;

  const tracking_data = {
    utc_timestamp: st,
    ist_timestamp: ist_now,
    origin_page,
    client_ip,
    referrer,
    geo: geo_data,
    device_type,
    unique_user_id: user_id
  };

  supabase
    .from(SUPABASE_TABLE)
    .insert([tracking_data])
    .then(() => {
      res.set('Content-Type', 'image/gif');
      res.send(Buffer.from(pixel_data));
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
});



function getGeoData(ip) {
  const geo = geoip.lookup(ip);
  return geo ? geo.country : '';
}

function getDeviceType(userAgent) {
  if (userAgent && /mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return 'Mobile';
  } else if (userAgent && /tablet/i.test(userAgent)) {
    return 'Tablet';
  } else {
    return 'Laptop/Desktop';
  }
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
