const express = require('express')
const app = express()
const validator = require('deep-email-validator');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {

    console.log("You hit the root api request");
    return res.status(200).json({
        message: "Hello this api endpoint is for apifor.email website",
    });
});


app.post('/email-verification', async (req, res) => {
    const { email } = req.body;

    console.log(email);

      // Validate the email address
    const { valid, reason } = await validator.validate(email);

    if (!valid) {
        return res.status(400).json({ message: 'Invalid email address.', reason: reason });
    }
    
      // Return the verified email response
    return res.status(200).json({ message: 'Email address verified successfully.', email: email, valid: valid });
});

app.listen(process.env.PORT || 3000)