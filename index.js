const fs = require('fs');
const axios = require('axios');
const qs = require('qs');
const HttpsProxyAgent = require('https-proxy-agent');

// Load bot config
const config = JSON.parse(fs.readFileSync('bot.json', 'utf-8'));

const headers = {
  'User-Agent': config.user_agent,
  'Cookie': config.fb_cookie
};

const agent = config.proxy ? new HttpsProxyAgent(config.proxy) : null;

async function getFbDtsgAndJazoest() {
  const res = await axios.get('https://mbasic.facebook.com', {
    headers,
    httpsAgent: agent
  });

  const fb_dtsg = res.data.match(/name="fb_dtsg" value="(.*?)"/)?.[1];
  const jazoest = res.data.match(/name="jazoest" value="(.*?)"/)?.[1];

  if (!fb_dtsg || !jazoest) throw new Error("fb_dtsg or jazoest not found.");

  return { fb_dtsg, jazoest };
}

async function postToGroup() {
  try {
    if (config.log) console.log("[*] Logging into Facebook...");

    const { fb_dtsg, jazoest } = await getFbDtsgAndJazoest();

    if (config.log) console.log("[*] Preparing to post to group...");

    const postData = {
      fb_dtsg,
      jazoest,
      'target': config.group_id,
      'c_src': 'group',
      'cwevent': 'compose',
      'referrer': 'group',
      'ctype': 'inline',
      'cver': 'amber',
      'rst_icv': '',
      'view_post': 'Post',
      'xc_message': config.message
    };

    const postUrl = `https://mbasic.facebook.com/groups/${config.group_id}/posts/`;

    const res = await axios.post(postUrl, qs.stringify(postData), {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      httpsAgent: agent
    });

    if (res.status === 200) {
      console.log(`[✓] Successfully posted to group ${config.group_id}`);
    } else {
      console.error("[×] Failed to post:", res.status);
    }

  } catch (err) {
    console.error("[×] Error posting:", err.message);
  }
}

async function run() {
  if (!config.auto_post) {
    console.log("Auto post is disabled. Exiting.");
    return;
  }

  console.log(`[⏳] Waiting ${config.delay_seconds}s before posting...`);
  await new Promise(r => setTimeout(r, config.delay_seconds * 1000));

  await postToGroup();
}

run();
