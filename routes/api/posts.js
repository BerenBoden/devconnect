const express = require('express')
const router = express.Router();

//Request type: GET api/posts
//Description: test route
//Access: PUBLIC
router.get('/', (req,res) => {res.send('Posts route')})

module.exports = router;