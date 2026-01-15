# llm-open-connector-nvidia

A secure API proxy service for Hugging Face chat completions, providing a standardized interface with security, validation, and comprehensive logging capabilities.

## Overview

This Node.js Express application acts as a secure proxy layer between clients and Hugging Face's chat completion API. It adds validation, security headers, rate limiting, and detailed logging while maintaining compatibility with the Hugging Face API format.

## Features

- 🔒 **Security**: API key authentication, Helmet security headers, CORS protection
- ✅ **Validation**: Joi schema validation for all incoming requests
- 📊 **Logging**: Comprehensive request/response payload logging with sensitive data sanitization
- 📚 **API Documentation**: Interactive Swagger UI at `/api-docs`
- 🚦 **Rate Limiting**: 100 requests per 15 minutes per IP
- 🔄 **Message Processing**: Automatic system message consolidation
- 🌐 **Heroku Ready**: Configured for Heroku deployment with Procfile

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Hugging Face API key and endpoint URL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jerrywang951027/sfdcllmopenconnectornim.git
cd sfdcllmopenconnectornim
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
HUGGING_FACE_API_KEY=your_hugging_face_api_key
HUGGING_FACE_API_URL=https://api-inference.huggingface.co
PORT=3501
USE_THIRD_PARTY_ROUTER=false
ALLOWED_ORIGINS=http://localhost:3501,https://yourdomain.com
```

## Configuration

### Required Environment Variables

- `HUGGING_FACE_API_KEY` - Your Hugging Face API key (required)
- `HUGGING_FACE_API_URL` - Hugging Face API endpoint URL (required)

### Optional Environment Variables

- `PORT` - Server port (default: 3501)
- `USE_THIRD_PARTY_ROUTER` - Use third-party router mode (default: false)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `API_BASE_URL` - Base URL for API documentation (default: http://localhost:3501)

## Usage

### Start the Server

```bash
npm start
```

The server will start on the configured port (default: 3501).

### API Endpoints

#### Root Endpoint

- `GET /` - Redirects browsers to `/api-docs`, returns JSON for API clients

#### API Documentation

- `GET /api-docs` - Interactive Swagger UI documentation
- `GET /api-docs.json` - OpenAPI JSON specification

#### Chat Completions

- `POST /chat/completions` - Create a chat completion

**Headers:**
```
api-key: your_hugging_face_api_key
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "nvidia/nemotron-3-nano-30b-a3b",
  "messages": [
    {
      "role": "user",
      "content": "what is the meaning of repudiation"
    }
  ],
  "temperature": 1,
  "top_p": 1,
  "n": 1,
  "max_tokens": 16384,
  "reasoning_budget": 16384,
  "seed": 42,
  "chat_template_kwargs": {
    "enable_thinking": true
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "object": "chat.completion",
  "created": 1699123456,
  "model": "nvidia/nemotron-3-nano-30b-a3b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response content here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 8,
    "total_tokens": 23
  }
}
```

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model` | string | Yes | - | Model identifier (e.g., "nvidia/nemotron-3-nano-30b-a3b") |
| `messages` | array | Yes | - | Array of message objects with `role` and `content` |
| `max_tokens` | integer | No | 500 | Maximum number of tokens to generate |
| `temperature` | number | No | - | Sampling temperature (0+) |
| `top_p` | number | No | - | Nucleus sampling parameter (0-1) |
| `n` | integer | No | 1 | Number of chat completion choices to generate |
| `reasoning_budget` | integer | No | - | Budget for reasoning tokens |
| `seed` | integer | No | - | Random seed for reproducible outputs |
| `chat_template_kwargs` | object | No | - | Chat template configuration |
| `chat_template_kwargs.enable_thinking` | boolean | No | - | Enable thinking/reasoning mode |

### Message Roles

- `system` - System instructions (multiple system messages are automatically consolidated)
- `user` - User messages
- `assistant` - Assistant messages

## Project Structure

```
llm-open-connector-nvidia/
├── config/
│   ├── index.js          # Configuration and environment validation
│   └── swagger.js         # Swagger/OpenAPI configuration
├── controllers/
│   └── chatController.js  # Chat completion logic and validation
├── middleware/
│   └── index.js           # API key validation and error handling
├── routes/
│   └── chat.js            # Chat routes with Swagger documentation
├── utils/
│   └── logger.js          # Sanitized logger utility
├── index.js               # Main application entry point
├── package.json           # Dependencies and scripts
├── Procfile               # Heroku process file
└── README.md             # This file
```

## Security Features

- **API Key Authentication**: All `/chat` endpoints require a valid `api-key` header
- **Helmet Security Headers**: Comprehensive security headers including CSP, HSTS, XSS protection
- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Input Validation**: Joi schema validation for all request payloads
- **Sensitive Data Sanitization**: Automatic redaction of API keys, tokens, and emails in logs

## Logging

The application provides comprehensive logging for:

1. **Received Request Payload**: Logged before validation (raw request body)
2. **Outbound Request Payload**: Logged before sending to Hugging Face API
3. **Received Response Payload**: Logged for both success and failure cases

All logs are written to stdout/stderr for Heroku compatibility and include automatic sanitization of sensitive information.

### Log Format

Logs appear in the format:
```
[INFO] Received request payload: {...}
[INFO] Outbound request payload: {...}
[INFO] Received response payload (success): {...}
[ERROR] Received response payload (failure): {...}
```

## Deployment

### Heroku Deployment

1. Create a Heroku app:
```bash
heroku create llm-open-connector-nvidia
```

2. Set environment variables:
```bash
heroku config:set HUGGING_FACE_API_KEY=your_key
heroku config:set HUGGING_FACE_API_URL=your_url
heroku config:set USE_THIRD_PARTY_ROUTER=false
```

3. Deploy:
```bash
git push heroku main
```

### View Logs on Heroku

```bash
heroku logs --tail -a llm-open-connector-nvidia
```

## Development

### Format Code

```bash
npm run format:write
```

### Local Development

1. Create `.env` file with required variables
2. Run `npm start`
3. Access API documentation at `http://localhost:3501/api-docs`

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. The documentation includes:

- Request/response schemas
- Example requests
- Try-it-out functionality
- Authentication testing

## Error Handling

The application includes comprehensive error handling:

- **400 Bad Request**: Validation errors (returns Joi error details)
- **401 Unauthorized**: Invalid or missing API key
- **500 Internal Server Error**: Server errors with detailed logging

## Dependencies

### Production Dependencies

- `express` - Web framework
- `axios` - HTTP client for Hugging Face API
- `joi` - Schema validation
- `winston` - Logging
- `helmet` - Security headers
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `swagger-ui-express` - API documentation UI
- `swagger-jsdoc` - OpenAPI specification generation
- `uuid` - Unique ID generation
- `dotenv` - Environment variable management

### Development Dependencies

- `prettier` - Code formatting
- `@types/express-rate-limit` - TypeScript types

## License

This project is proprietary and confidential.

## Support

For issues and questions, please contact the development team or create an issue in the repository.
