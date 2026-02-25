import LexClient from './LexClient';

jest.mock('@aws-sdk/client-lex-runtime-v2');

const mockSend = jest.fn().mockResolvedValue({
    sessionState: { sessionAttributes: { foo: 'bar' } },
    messages: [{ content: 'This is a mocked message.' }],
});

// Need to bypass type safety of typescript to allow this approach for mocking to work.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { LexRuntimeV2Client } = require('@aws-sdk/client-lex-runtime-v2');

LexRuntimeV2Client.prototype.send = mockSend;

test('LexClient.speak()', async (): Promise<void> => {
    const botContext = {
        botId: 'TESTBOTID1',
        botAliasId: 'TSTALIASID',
        localeId: 'en_US',
        region: 'us-east-1',
    };
    const userContext = {
        userId: 'homer',
        userAttributes: {
            firstName: 'Homer',
            lastName: 'Simpson',
            address: 'Springfield',
        },
    };
    const botClient = new LexClient(botContext, userContext);
    const reply = await botClient.speak('Hello World');
    expect(reply).toBe('This is a mocked message.');
});
