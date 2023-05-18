const express = require('express')
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {

    console.log("You hit the root api request");
    return res.status(200).json({
        message: "Hello this api endpoint is for apifor.email website",
    });
});


app.post('/email-verification', (req, res) => {
    const { email } = req.body;

    console.log(email);

    return res.status(200).json({
        message: "Email recevied for verification", email: email
    });
});

app.listen(process.env.PORT || 3000)