const PublicationService = require('../../services/web/publicationTime.service.js');

class PublicationController {
    static async getPublicationDetails(req, res) {
        try {
          
        } catch (error) {
            console.error('Error fetching Publication details:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching Publication details',
            });
        }
    }
}

module.exports = PublicationController;
