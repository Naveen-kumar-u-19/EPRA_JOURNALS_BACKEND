const PaperService = require('../../services/web/paper.service');

class PaperController {
    static async getPaperStatus(req, res) {
        try {
            const { paperIndex } = req.query;

            if (!paperIndex) {
                return res.status(400).json({
                    success: false,
                    message: 'Paper Index is required',
                });
            }

            const paperStatus = await PaperService.getPaperStatus(paperIndex);

            if (!paperStatus) {
                return res.status(404).json({
                    success: false,
                    message: 'Paper not found',
                });
            }

            return res.status(200).json({
                success: true,
                paperStatus,
            });
        } catch (error) {
            console.error('Error fetching paper status:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the paper status',
            });
        }
    }
    // Get Paper Authors
    static async getPaperAuthors(req, res) {
        try {
            const { paperIndex } = req.query;

            if (!paperIndex) {
                return res.status(400).json({
                    success: false,
                    message: 'Paper Index is required',
                });
            }

            const authors = await PaperService.getPaperAuthors(paperIndex);

            if (!authors) {
                return res.status(404).json({
                    success: false,
                    message: 'Paper not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: authors,
            });
        } catch (error) {
            console.error('Error fetching authors:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching authors',
            });
        }
    }

}

module.exports = PaperController;
