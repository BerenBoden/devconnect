const express = require('express')
const connectDB = require('./config/db');
const bodyParser = require('body-parser')

const app = express();

app.get('/', (req, res) => {
    res.send('Api running')
})


//Initialize middleware, handle JSON post requests
app.use(bodyParser.urlencoded({ extended: false }));           
app.use(bodyParser.json()) 

//Define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

connectDB();

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));