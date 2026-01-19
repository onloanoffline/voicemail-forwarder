const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.get('/', (req, res) => {
    res.send('Twilio Recording Forwarder - Server is running! ✅');
});

app.post('/forward-recording', async (req, res) => {
    const recordingUrl = req.body.RecordingUrl;
    const fromNumber = req.body.From || 'Unknown';

    console.log('Recording received:', recordingUrl);
    console.log('From:', fromNumber);

    try {
        const call = await client.calls.create({
            url: `https://voicemail-forwarder.up.railway.app/play-recording?url=${encodeURIComponent(recordingUrl)}&from=${encodeURIComponent(fromNumber)}`,
            to: 'sip:3479662201@208.100.60.66',
            from: '+18452039996'
        });

        console.log('Call initiated:', call.sid);
        res.status(200).send('Recording forwarded');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error forwarding recording');
    }
});

app.post('/play-recording', (req, res) => {
    const recordingUrl = req.query.url;
    const fromNumber = req.query.from || 'Unknown';

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    twiml.say(`You have a new voicemail from ${fromNumber}`);
    twiml.play(recordingUrl);

    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
