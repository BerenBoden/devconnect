const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const config = require('config');
const jwt = require('jsonwebtoken');
//Load in user model
const User = require('../../models/User');

//Request type: POST api/users
//Description: Register a new user
//Access: PUBLIC

router.post('/', 
    //Using express-validator for user registration
    [
        //Name validation
        check('name', 'Name is required')
        .not()
        .isEmpty(),
        //Email validation
        check('email', 'Email is required')
        .isEmail(),
        //Password validation
        check('password', 'Please enter a password with 6 or more characters')
        .isLength({min: 6})
    ], 
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        //Destructure methods from request
        const { name, email, password} = req.body

        try {
            
            let user = await User.findOne({email});
            //Check if user exists
            if(user){
                return res.status(400).json({errors: [{msg: 'User already exists'}] });
            }

            //Get user's gravatar 
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            //Create new user instance
            user = new User({
                name,
                email,
                avatar,
                password
            });

            //Encrypt user's password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt) 
            
            await user.save();
    
            //Return JWT
            
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, 
                config.get('jwtSecret'), 
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