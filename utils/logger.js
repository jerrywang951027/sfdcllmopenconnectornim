import winston from 'winston';

// Helper function to sanitize sensitive data
const sanitizeMessage = (message) => {
    if (typeof message !== 'string') {
        message = String(message);
    }
    return message
        .replace(/Authorization:.*?(?=\s|$)/gi, 'Authorization: [REDACTED]')
        .replace(/api[_-]?key:.*?(?=\s|$)/gi, 'api_key: [REDACTED]')
        .replace(/Bearer\s+[A-Za-z0-9-._~+/]+=*/g, 'Bearer [REDACTED]')
        .replace(/"token":\s*"[^"]*"/g, '"token": "[REDACTED]"')
        .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[EMAIL REDACTED]');
};

const createSanitizedLogger = (options = {}) => {
    // Simple format that writes directly to stdout
    const simpleFormat = winston.format.printf((info) => {
        const message = sanitizeMessage(info.message || '');
        return `${info.level}: ${message}`;
    });

    const defaultOptions = {
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.colorize({ all: false }), // Disable colors for Heroku
            simpleFormat
        ),
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                handleRejections: true,
                // Ensure immediate flush for Heroku
                stderrLevels: ['error'],
            })
        ],
        // Disable exit on error to prevent crashes
        exitOnError: false,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const logger = winston.createLogger(mergedOptions);
    
    // Ensure logs are flushed immediately (important for Heroku)
    logger.stream = {
        write: (message) => {
            logger.info(message.trim());
        }
    };

    return logger;
};

export default createSanitizedLogger;
