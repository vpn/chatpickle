import { LexRuntimeV2Client, RecognizeTextCommand } from '@aws-sdk/client-lex-runtime-v2';
import get from 'lodash.get';
import { BotClient } from './BotClient';

export default class LexClient extends BotClient {
    private botId: string;
    private botAliasId: string;
    private localeId: string;
    private sessionId: string;
    private lastResponse: any;
    private sessionAttributes: any;
    private lex: LexRuntimeV2Client;

    constructor(botContext: any, userContext: any) {
        super(botContext, userContext);
        this.botId = this.botContext.botId;
        this.botAliasId = this.botContext.botAliasId;
        this.localeId = this.botContext.localeId || 'en_US';
        this.sessionId = `${this.userContext.userId}-${Date.now()}`;
        this.lastResponse = null;
        this.sessionAttributes = this.userContext.userAttributes;

        const clientConfig: any = {
            region: this.botContext.region,
        };
        // Optional Auth Environment Variables - Support both custom and standard AWS env vars
        const accessKeyId = process.env.chatpickle_access_id || process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.chatpickle_access_secret || process.env.AWS_SECRET_ACCESS_KEY;

        if (accessKeyId && secretAccessKey) {
            clientConfig.credentials = {
                accessKeyId,
                secretAccessKey,
            };
        }

        this.lex = new LexRuntimeV2Client(clientConfig);
        console.log(`[${this.sessionId}] New Conversation with ${this.botId}`);
    }

    public async speak(inputText: string): Promise<string> {
        console.log(`[${this.sessionId}] User: ${inputText}`);

        const command = new RecognizeTextCommand({
            botId: this.botId,
            botAliasId: this.botAliasId,
            localeId: this.localeId,
            sessionId: this.sessionId,
            text: inputText,
            sessionState: {
                sessionAttributes: this.sessionAttributes,
            },
        });

        this.lastResponse = await this.lex.send(command);
        this.sessionAttributes = this.lastResponse.sessionState?.sessionAttributes;

        const message = this.lastResponse.messages?.[0]?.content;
        const reply: string = message ? message.trim() : '';

        console.log(`[${this.sessionId}] Bot: ${reply}`);

        return reply;
    }

    public async fetch(attributePath: string): Promise<string> {
        return await get(this.lastResponse, attributePath);
    }
}
