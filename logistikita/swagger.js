const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LogistiKita API Documentation',
            version: '1.0.0',
            description: 'API documentation for LogistiKita - Multi-Role Logistics Management System',
            contact: {
                name: 'LogistiKita Team',
                email: 'support@logistikita.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Customer/Landing Server'
            },
            {
                url: 'http://localhost:3001',
                description: 'Admin Dashboard Server'
            },
            {
                url: 'http://localhost:3002',
                description: 'Super Admin Server'
            },
            {
                url: 'http://localhost:3003',
                description: 'Operator Cabang Server'
            },
            {
                url: 'http://localhost:3004',
                description: 'Kurir Lapangan Server'
            },
            {
                url: 'http://localhost:3005',
                description: 'Simulator Mitra Server'
            }
        ],
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API Key for partner access'
                },
                bearerToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Token for authenticated users'
                }
            },
            schemas: {
                Shipment: {
                    type: 'object',
                    required: ['recipient_name', 'recipient_phone', 'destination'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Shipment ID'
                        },
                        recipient_name: {
                            type: 'string',
                            description: 'Recipient name'
                        },
                        recipient_phone: {
                            type: 'string',
                            description: 'Recipient phone number'
                        },
                        destination: {
                            type: 'string',
                            description: 'Destination address'
                        },
                        awb_number: {
                            type: 'string',
                            description: 'Air Waybill number'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in_transit', 'delivered', 'failed'],
                            description: 'Shipment status'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Partner: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer'
                        },
                        name: {
                            type: 'string'
                        },
                        api_key: {
                            type: 'string'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive']
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'Error'
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    },
    apis: [
        './routes/apiRoutes.js',
        './routes/authRoutes.js',
        './routes/logistikRoutes.js',
        './routes/gatewayRoutes.js',
        './routes/internalRoutes.js',
        './routes/marketplaceRoutes.js',
        './server.js'
    ]
};

const specs = swaggerJsdoc(options);
module.exports = specs;
