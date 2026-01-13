import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'sfdcllmopenconnectornim API',
            version: '1.0.0',
            description: 'API proxy for Hugging Face chat completions with security and validation',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:3000',
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'api-key',
                    description: 'API key for authentication',
                },
            },
        },
        tags: [
            {
                name: 'Chat',
                description: 'Chat completion endpoints',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

