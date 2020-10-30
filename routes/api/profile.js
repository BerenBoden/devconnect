const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//Request type: GET api/profile/me
//Description: Get current user profile
//Access: PRIVATE

router.get('/me', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//Request type: POST api/profile/
//Description: Create or update user profile
//Access: PRIVATE

router.post('/', 
    [
        auth, [
            check('status', 'Status is required')
            .not()
            .isEmpty(),
            check('skills', 'Skills is required')
            .not()
            .isEmpty()
        ]   
    ], async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            })
        }

        //Pull data from the body
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //Build profile object to insert into database
        const profileFields = {};
        profileFields.user = req.user.id;
        //Check if fields are available
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram = instagram;
        

        try {
            //Update if profile found
            let profile = await Profile.findOne({user: req.user.id});
            if(profile){
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id}, 
                    {$set: profileFields}, 
                    {new: true}
                );
                return res.json(profile);
            }

            //Create new if not found
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
            //Errors
        }catch(err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }
    }
);

//Request type: GET api/profile
//Description: Get all profiles
//Access: PUBLIC

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles)
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
})

//Request type: GET api/profile/user/:user_id
//Description: Get profile by user ID
//Access: PUBLIC

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg: 'Profile not found'})
        }
        res.json(profile)
    } catch(err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found'})
        }
        res.status(500).send('Server error')
    }
})

//Request type: DELETE api/profile
//Description: Delete profile, user & posts
//Access: PRIVATE

router.delete('/', auth, async (req, res) => {
    try {
        //Remove profile
        await Profile.findOneAndRemove({user: req.user.id}).populate('user', ['name', 'avatar']);
        //Remove user
        await User.findOneAndRemove({_id: req.user.id}).populate('user', ['name', 'avatar']);

        res.json({msg: 'User deleted'})
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
})

module.exports = router;