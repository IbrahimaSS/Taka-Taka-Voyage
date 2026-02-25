const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration de base pour Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Taka Taka',
            version: '1.0.0',
            description: "Documentation de l'API pour l'application Taka Taka.",
            contact: {
                name: 'Support Taka Taka',
                email: 'support@takataka.com',
            },
        },
        tags: [
            { name: "1 - Authentification", description: "Routes liées à la connexion et à l'inscription" },
            { name: "2 - Chauffeurs", description: "Routes spécifiques aux chauffeurs" },
            { name: "3 - Passagers", description: "Routes spécifiques aux passagers" },
            { name: "4 - Admin", description: "Routes du tableau de bord d'administration" },
            { name: "5 - Autres", description: "Routes communes et services annexes" }
        ],
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Serveur de développement local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Chemins vers les fichiers où sont définies les annotations Swagger
    apis: ['./src/routes/**/*.js', './src/controllers/**/*.js', './src/models/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    // Route pour voir l'UI de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "API Taka Taka Docs"
    }));

    // Route exposant le fichier JSON généré
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📄 Documentation Swagger disponible sur http://localhost:5000/api-docs');
};

module.exports = setupSwagger;
