const CertificateService = require('../../services/web/certificate.service');

class CertificateController {
    static async getCertificateDetails(req, res) {
        try {
            const { certificateId } = req.query;

            if (!certificateId) {
                return res.status(400).json({
                    success: false,
                    message: 'Certificate ID is required',
                });
            }

            const certificateDetails = await CertificateService.getCertificateDetails(certificateId);

            if (!certificateDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Certificate details not found',
                });
            }

            return res.status(200).json({
                success: true,
                ...certificateDetails,
            });
        } catch (error) {
            console.error('Error fetching certificate details:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching certificate details',
            });
        }
    }
}

module.exports = CertificateController;
