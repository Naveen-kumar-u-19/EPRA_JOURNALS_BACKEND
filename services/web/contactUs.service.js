const ContactUs = require('../../models/contactUs');
const { sequelize } = require('../../models');

class ContactService {
    // Submit Contact Form
    static async submitContactForm(name, email, phone, subject, message) {
        const [result] = await sequelize.query(
            `INSERT INTO contact_us (name, email, phone, subject, message, created_at, updated_at) 
             VALUES (:name, :email, :phone, :subject, :message, NOW(), NOW());`,
            { 
                type: sequelize.QueryTypes.INSERT,
                replacements: { name, email, phone, subject, message } // Prevents SQL injection
            }
        );
    
        return result;
    }
}

module.exports = ContactService;
