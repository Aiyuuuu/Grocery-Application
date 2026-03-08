const express = require('express');
let app = express();

app.get('/', (req, res) => {
    res.status(200).json({message: 'Hello from the express server!', status: 200})
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log('server has started...')
})

