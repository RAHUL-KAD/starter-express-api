const express = require('express');
const app = express();
const geoip = require('geoip-lite');
const { createClient } = require('@supabase/supabase-js');
const base64 = require('base64-js');
const { DateTime } = require('luxon');

const SUPABASE_URL = 'https://xwskviprdexmphfivdtm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Add your Supabase service_role API key
const SUPABASE_TABLE = 'pixel-tracker';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.get('/', (req, res) => {
  res.send('Hello from tinypixel!');
});

app.get('/status', (req, res) => {
  res.send('ok!');
});

app.get('/pixel.gif', (req, res) => {
  const origin_page = req.query.page || 'main';
  const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const referrer = req.headers.referer || '';
  const geo_data = getGeoData(client_ip);
  const user_agent = req.headers['user-agent'] || '';
  const device_type = getDeviceType(user_agent);

  const pixel_data = base64.toByteArray('R0lGODlhAQABAIAAAP8AAP8AACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');

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
