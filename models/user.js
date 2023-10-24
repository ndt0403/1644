const User = require('../models/user'); // Assuming you have a "User" model

// POST for registration form
router.post('/register', async function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Save the new user to the database
        const user = await User.create({
            username,
            password,
        });

        // Handle registration success

        res.redirect('/users/login'); // Redirect to the login page after registration
    } catch (error) {
        // Handle registration error

        res.redirect('/users/register'); // Redirect back to the registration page in case of an error
    }
});




