const express = require('express')
const app = express()
app.get('/', (req, res) => {
    return res.status(200).json({
        message: "Hello this api endpoint is for apifor.email website",
    });
});
app.listen(process.env.PORT || 3000)