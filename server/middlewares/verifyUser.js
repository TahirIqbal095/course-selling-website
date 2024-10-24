const jwt = require("jsonwebtoken");

function verify(secret) {
    return function (req, res, next) {
        const token = req.headers["authorization"];

        if (!token) {
            return res.status(401).json({
                message: "unauthorized user",
            });
        }

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: "invalid token",
                });
            }

            req.userId = decoded.id;
            next();
        });
    };
}

module.exports = {
    verify,
};
