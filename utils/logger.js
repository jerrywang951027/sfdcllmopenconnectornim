import winston from 'winston';

const createSanitizedLogger = (options = {}) => {
    // Custom format that sanitizes sensitive data and ensures proper output
    const sanitizeFormat = winston.format.printf((info) => {
        let message = info.message || '';
        
        // Sanitize sensitive information
        message = message
            .replace(/Authorization:.*?(?=\s|$)/gi, 'Authorization: [REDACTED]')
            .replace(/api[_-]?key:.*?(?=\s|$)/gi, 'api_key: [REDACTED]')
            .replace(/Bearer\s+[A-Za-z0-9-._~+/]+=*/g, 'Bearer [REDACTED]')
            .replace(/"token":\s*"[^"]*"/g, '"token": "[REDACTED]"')
            .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[EMAIL REDACTED]');
        
        // Format: level: message
        return `${info.level}: ${message}`;
    });

    const defaultOptions = {
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            sanitizeFormat
        ),
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                handleRejections: true,
            })
        ],
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return winston.createLogger(mergedOptions);
};

export default createSanitizedLogger;
