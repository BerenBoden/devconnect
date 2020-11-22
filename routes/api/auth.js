const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

//Request type: POST api/auth
//Description: Authenticate user & get token
//Access: PUBLIC
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
})

//Request type: POST api/auth
//Description: Authenticate user & get token
//Access: PUBLIC
router.post('/',
    //Using express-validator for user registration
    [
        //Name validation
        check('email', 'Email is required').isEmail(),
        check('password','Password is required').exists()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        //Destructure methods from request
        const {email, password} = req.body
        
        try {
            //Request to db to fetch a user
            let user = await User.findOne({email});

            if(!user){
                return res.status(400)
                .json({errors: [{msg: 'Invalid credentials'}] });
            }
            
            //First parameter is the users password input, second parameter is users password stored in database
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400)
                .json({errors: [{msg: 'Invalid credentials'}] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, 
                config.get('jwtSecret'), 
                //Change to 3600, 36000 is development
                {expiresIn: 36000}, 
                (err, token) => {
                    if(err) throw err;
                    res.json({token});
                    res.send({token});
                }
            );
        } catch(err) {
            console.error(err.message);
            res.status(500).send('server error')
        }
    }
);

module.exports = router;