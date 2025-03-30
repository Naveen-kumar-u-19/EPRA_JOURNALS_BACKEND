const Author = require('../../models/author');
const Paper = require('../../models/paper');
const Journal = require('../../models/journal');

class CertificateService {
    static async getCertificateDetails(certificateId) {
        if (!certificateId) {
            throw new Error('Certificate ID is required');
        }

        // Fetch the author and related paper/journal details
        const author = await Author.findOne({
            where: {
                id: certificateId,
                isDeleted: false,
                isCertificateEnabled: true, // Only fetch if the certificate is enabled
            },
            include: [
                {
                    model: Paper,
                    as: 'paper',
                    where: { isDeleted: false },
                    include: [
                        {
                            model: Journal,
                            as: 'journal',
                        },
                    ],
                },
            ],
        });

        if (!author || !author.paper || !author.paper.journal) {
            return null;
        }

        // Prepare certificate details
        return {
            authorName: author.authorName,
            paperTitle: author.paper.paperTitle,
            paperIndex: author.paper.paperIndex,
            journalName: author.paper.journal.name,
            issnNumber: author.paper.journal.issnNumber,
            impactFactor: author.paper.journal.impactFactor,
            volume: author.paper.journal.volume,
            issue: author.paper.journal.issue,
        };
    }
}

module.exports = CertificateService;
