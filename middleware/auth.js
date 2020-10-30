const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req,res,next){
    //Get token from header
    const token = req.header('x-auth-token')

    //Check if not token
    if(!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    //Verify token
    try {
        //Decode token if token available
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user
        next();
    }catch(err) {
        //If token is avaiable but not valid
        res.status(401).json({msg: 'Token is not valid'})
    }
}