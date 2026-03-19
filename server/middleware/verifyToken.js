import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    try {
        //read token fron req
        let token = req.cookies?.token;
        // console.log(token);
        if(!token) {
            return res.status(400).json({message : "Unauthorized req, Please Login"});
        }
        //verify the validity of the token(decoding)
        let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;
        next();
        //forward req to next middleware/route
    }catch(err) {
        // return res.status(401).json({ message: "Invalid or Expired Token" });
        if(err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session Expired.." });
        }
        if(err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Please login" });
        }
    }
};