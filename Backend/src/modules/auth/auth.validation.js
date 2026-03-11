const { body } = require('express-validator');

exports.registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.loginValidation = [
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.phone) {
            throw new Error('Email or Phone is required');
        }
        return true;
    })
];
