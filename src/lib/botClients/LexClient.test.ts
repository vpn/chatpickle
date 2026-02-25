import LexClient from './LexClient';

jest.mock('@aws-sdk/client-lex-runtime-service');

const mockSend = jest.fn().mockResolvedValue({
    sessionAttributes: { foo: 'bar' },
    message: 'This is a mocked message.',
});

// Need to bypass type safety of typescript to allow this approach for mocking to work.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { LexRuntimeServiceClient } = require('@aws-sdk/client-lex-runtime-service');

LexRuntimeServiceClient.prototype.send = mockSend;

test('LexClient.speak()', async (): Promise<void> => {
    const botContext = {
        botName: 'OrderFlowers',
        botAlias: 'prod',
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
