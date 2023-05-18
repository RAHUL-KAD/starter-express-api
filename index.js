const express = require('express')
const app = express()
app.get('/', (req, res) => {
    return res.status(200).json({
        message: "Hello from root!",
    });
});
app.listen(process.env.PORT || 3000)