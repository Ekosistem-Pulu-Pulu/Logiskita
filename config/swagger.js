const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'LogistiKita API',
            version: '1.0.0',
            description: 'Dokumentasi API untuk LogistiKita',
            contact: {
                name: 'LogistiKita Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server (Customer/Gateway)'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API Key untuk Mitra/B2B'
                },
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Token untuk Internal/Admin'
                }
            }
        }
    },
    apis: ['./routes/*.js', './server.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerDocs
};
