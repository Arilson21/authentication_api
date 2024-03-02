// Importing necessary modules
const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

// Creating a nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,      // SMTP server hostname
    port: process.env.MAIL_PORT,      // SMTP server port
    auth: {
        user: process.env.MAIL_USER,  // User for SMTP authentication
        pass: process.env.MAIL_PASS   // Password for SMTP authentication
    },
    tls: { rejectUnauthorized: false } // Disabling TLS rejection for self-signed certificates (use with caution)
});

// Configuring nodemailer to use Handlebars for email templates
transporter.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',  // Handlebars file extension
        partialsDir: path.resolve('./src/resources/mail/partials'),  // Directory for partials
        defaultLayout: path.resolve('./src/resources/mail/main.handlebars'),  // Default layout for emails
    },
    viewPath: path.resolve('./src/resources/mail/'),  // Directory where email templates are located
    extName: '.html',  // Output file extension after compilation
}));


module.exports = transporter;

