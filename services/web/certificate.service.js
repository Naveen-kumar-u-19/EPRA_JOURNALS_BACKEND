const Author = require('../../models/author');
const Paper = require('../../models/paper');
const Journal = require('../../models/journal');
const path = require('path');

const { createCanvas, loadImage } = require('canvas');

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

    static async generateCertificateImage(certificateDetails) {
        try {
            // const { authorName, paperTitle } = certificateDetails;
            const  authorName = "Carmel Dev", paperTitle = "Test paper 123";
            const canvas = createCanvas(1200, 800);
            const ctx = canvas.getContext('2d');

            // Load background template
            const backgroundPath = path.join(__dirname, '../../assets/images/certificate_1.jpg');
            const background = await loadImage(backgroundPath);

            // const background = await loadImage('../../assets/images/certificate_1.webp'); // Update path properly
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Draw Texts
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText('Certificate of Publication', 350, 200);

            ctx.font = '30px Arial';
            ctx.fillText(`Awarded to: ${authorName}`, 300, 400);

            ctx.font = '24px Arial';
            ctx.fillText(`For the paper titled: "${paperTitle}"`, 200, 500);

            ctx.font = '20px Arial';
            ctx.fillText('Journal of Scientific Research', 380, 600);

            // Return stream and filename
            const fileName = `${authorName.replace(/\s+/g, '_')}_certificate.jpg`;

            return { stream: canvas.createJPEGStream({ quality: 0.8 }), fileName };
        } catch (error) {
            throw error;
        }
    }

}

module.exports = CertificateService;
