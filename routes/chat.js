import express from 'express';
import { chatCompletion } from '../controllers/chatController.js';

const router = express.Router();

/**
 * @swagger
 * /chat/completions:
 *   post:
 *     summary: Create a chat completion
 *     description: Send a chat completion request to Hugging Face API. The request will be validated and proxied to the Hugging Face endpoint.
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *               - model
 *             properties:
 *               messages:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of message objects with role and content
 *                 items:
 *                   type: object
 *                   required:
 *                     - role
 *                     - content
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [system, user, assistant]
 *                       description: The role of the message sender
 *                     content:
 *                       type: string
 *                       description: The content of the message
 *               model:
 *                 type: string
 *                 description: The model identifier to use for completion
 *                 example: "meta-llama/Llama-2-7b-chat-hf"
 *               max_tokens:
 *                 type: integer
 *                 minimum: 1
 *                 default: 500
 *                 description: Maximum number of tokens to generate
 *               temperature:
 *                 type: number
 *                 minimum: 0
 *                 description: Sampling temperature. Higher values make output more random.
 *               top_p:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Nucleus sampling parameter
 *               reasoning_budget:
 *                 type: integer
 *                 minimum: 1
 *                 description: Budget for reasoning tokens
 *               seed:
 *                 type: integer
 *                 description: Random seed for reproducible outputs
 *               chat_template_kwargs:
 *                 type: object
 *                 properties:
 *                   enable_thinking:
 *                     type: boolean
 *                     description: Enable thinking/reasoning mode
 *           example:
 *             model: "nvidia/nemotron-3-nano-30b-a3b"
 *             messages:
 *               - role: user
 *                 content: "what is the meaning of repudiation"
 *             temperature: 1
 *             top_p: 1
 *             max_tokens: 16384
 *             reasoning_budget: 16384
 *             seed: 42
 *             chat_template_kwargs:
 *               enable_thinking: true
 *     responses:
 *       200:
 *         description: Successful response with chat completion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the completion
 *                 object:
 *                   type: string
 *                   example: "chat.completion"
 *                 created:
 *                   type: integer
 *                   description: Unix timestamp of when the completion was created
 *                 model:
 *                   type: string
 *                   description: The model used for completion
 *                 choices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       index:
 *                         type: integer
 *                       message:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                           content:
 *                             type: string
 *                       finish_reason:
 *                         type: string
 *                 usage:
 *                   type: object
 *                   properties:
 *                     prompt_tokens:
 *                       type: integer
 *                     completion_tokens:
 *                       type: integer
 *                     total_tokens:
 *                       type: integer
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               object: "chat.completion"
 *               created: 1699123456
 *               model: "meta-llama/Llama-2-7b-chat-hf"
 *               choices:
 *                 - index: 0
 *                   message:
 *                     role: "assistant"
 *                     content: "The capital of France is Paris."
 *                   finish_reason: "stop"
 *               usage:
 *                 prompt_tokens: 15
 *                 completion_tokens: 8
 *                 total_tokens: 23
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "messages must contain at least 1 items"
 *       401:
 *         description: Unauthorized - invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: Invalid API key"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                     message:
 *                       type: string
 */
router.post('/completions', chatCompletion);

export default router;
