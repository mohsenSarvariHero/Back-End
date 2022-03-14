module.exports = {
    ensureAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        req.flash('error', 'please log in first');
        res.redirect('/users/login')

    }
}