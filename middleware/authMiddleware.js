// authMiddleware.js
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
};

module.exports = authenticateUser;