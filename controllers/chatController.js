import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import config from '../config/index.js';
import createSanitizedLogger from '../utils/logger.js';

const logger = createSanitizedLogger();

const chatCompletionSchema = Joi.object({
    messages: Joi.array()
        .items(
            Joi.object({
                role: Joi.string().valid('system', 'user', 'assistant').required(),
                content: Joi.string().required(),
            })
        )
        .min(1)
        .required(),
    model: Joi.string().required(),
    max_tokens: Joi.number().integer().min(1).default(500),
    temperature: Joi.number().min(0),
    top_p: Joi.number().min(0).max(1),
    n: Joi.number().integer().min(1).default(1),
    reasoning_budget: Joi.number().integer().min(1),
    seed: Joi.number().integer(),
    chat_template_kwargs: Joi.object({
        enable_thinking: Joi.boolean(),
    }),
});

export const chatCompletion = async (req, res, next) => {
    // Test log to verify function execution
    process.stdout.write(`[DEBUG] chatCompletion function called\n`);
    
    // Log received request payload BEFORE validation
    const receivedPayload = `Received request payload: ${JSON.stringify(req.body)}`;
    logger.info(receivedPayload);
    // Use process.stdout.write for guaranteed Heroku visibility
    process.stdout.write(`[INFO] ${receivedPayload}\n`);
    
    try {
        const { error, value } = chatCompletionSchema.validate(req.body);
        if (error) {
            process.stderr.write(`[ERROR] Validation error: ${error.details[0].message}\n`);
            return res.status(400).json({ error: error.details[0].message });
        }

        // Optimize message processing
        const systemMessages = [];
        const otherMessages = [];
        for (const message of value.messages) {
            if (message.role === 'system') {
                systemMessages.push(message.content);
            } else {
                otherMessages.push(message);
            }
        }

        const processedMessages = systemMessages.length > 0
            ? [{ role: 'system', content: systemMessages.join('\n') }, ...otherMessages]
            : otherMessages;

        const huggingFaceRequestBody = {
            model: value.model,
            messages: processedMessages,
            max_tokens: value.max_tokens,
            stream: false,
        };

        if (value.temperature !== undefined) {
            huggingFaceRequestBody.temperature = value.temperature;
        }
        if (value.top_p !== undefined) {
            huggingFaceRequestBody.top_p = value.top_p;
        }
        if (value.n !== undefined) {
            huggingFaceRequestBody.n = value.n;
        }
        if (value.reasoning_budget !== undefined) {
            huggingFaceRequestBody.reasoning_budget = value.reasoning_budget;
        }
        if (value.seed !== undefined) {
            huggingFaceRequestBody.seed = value.seed;
        }
        if (value.chat_template_kwargs !== undefined) {
            huggingFaceRequestBody.chat_template_kwargs = value.chat_template_kwargs;
        }

        // Log outbound request payload
        const outboundPayload = `Outbound request payload: ${JSON.stringify(huggingFaceRequestBody)}`;
        logger.info(outboundPayload);
        // Use process.stdout.write for guaranteed Heroku visibility
        process.stdout.write(`[INFO] ${outboundPayload}\n`);

        const response = await axios.post(
            config.useThirdPartyRouter 
                ? `${config.huggingFaceApiUrl}`
                : `${config.huggingFaceApiUrl}`,
            huggingFaceRequestBody,
            {
                headers: {
                    Authorization: `Bearer ${config.huggingFaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reshapedResponse = {
            id: uuidv4(),
            object: response.data.object,
            created: response.data.created,
            model: response.data.model,
            choices: response.data.choices,
            usage: response.data.usage,
        };

        // Log received response payload (success)
        const successResponse = `Received response payload (success): ${JSON.stringify(response.data)}`;
        logger.info(successResponse);
        // Use process.stdout.write for guaranteed Heroku visibility
        process.stdout.write(`[INFO] ${successResponse}\n`);

        res.status(200).json(reshapedResponse);
    } catch (error) {
        // Log received response payload (failure)
        const errorResponse = {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
        };
        const failureResponse = `Received response payload (failure): ${JSON.stringify(errorResponse)}`;
        logger.error(failureResponse);
        // Use process.stderr.write for guaranteed Heroku visibility
        process.stderr.write(`[ERROR] ${failureResponse}\n`);
        logger.error('Error in chat completion:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            response: error.response?.data,
        });
        next(error);
    }
};
