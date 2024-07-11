// middleware/authenticateUser.js

const authenticateUser = (req, res, next) => {
    const userId = req.session.userId; // Assuming user ID is stored in session
    if (!userId) {
        return res.status(401).send("Unauthorized");
    }
    req.userId = userId;
    next();
};

module.exports = authenticateUser;
