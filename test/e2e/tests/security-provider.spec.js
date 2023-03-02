const { strict: assert } = require('assert');
const { convertToHexValue, withFixtures } = require('../helpers');
const FixtureBuilder = require('../fixture-builder');

// const STALELIST_URL =
//   'https://eos9d7dmfj.execute-api.us-east-1.amazonaws.com/metamask/validate';

/**
 * @param {import('mockttp').Mockttp} mockServer - The mock server.
 * @param {object} metamaskSecurityProviderConfigResponse - The response for the dynamic phishing
 * configuration lookup performed by the warning page.
 */

async function setupSecurityProviderMocks(mockServer) {
  await mockServer
    .forPost(
      'https://eos9d7dmfj.execute-api.us-east-1.amazonaws.com/metamask/validate',
    )
    .thenCallback(() => {
      return {
        statusCode: 200,
        body: {
          flagAsDangerous: 0,
        },
      };
    });

  await mockServer
    .forPost(
      'https://eos9d7dmfj.execute-api.us-east-1.amazonaws.com/metamask/validate',
    )
    .thenCallback(() => {
      return {
        statusCode: 200,
        body: {
          flagAsDangerous: 1,
          reason: 'This site is known for phishing attempts.',
          reason_header: 'This could be a scam',
        },
      };
    });

  await mockServer
    .forPost(
      'https://eos9d7dmfj.execute-api.us-east-1.amazonaws.com/metamask/validate',
    )
    .thenCallback(() => {
      return {
        statusCode: 200,
        body: {
          flagAsDangerous: 2,
          reason: 'This site is not safe for browsing.',
          reason_header: 'This site is not safe',
        },
      };
    });
  await mockServer
    .forPost(
      'https://eos9d7dmfj.execute-api.us-east-1.amazonaws.com/metamask/validate',
    )
    .thenCallback(() => {
      return {
        statusCode: 401,
        body: {
          lagAsDangerous: 3,
          message: 'Unauthorized',
        },
      };
    });
}

describe('Transaction security provider', function () {
  function mockSecurityProviderDetection(mockServer, scenario) {
    switch (scenario) {
      case 'notMalicious':
        setupSecurityProviderMocks(mockServer, {
          statusCode: 200,
          body: {
            flagAsDangerous: 0,
          },
        });
        break;
      case 'malicious':
        setupSecurityProviderMocks(mockServer, {
          statusCode: 200,
          body: {
            flagAsDangerous: 1,
            reason: 'This site is known for phishing attempts.',
            reason_header: 'This could be a scam',
          },
        });
        break;
      case 'notSafe':
        setupSecurityProviderMocks(mockServer, {
          statusCode: 200,
          body: {
            flagAsDangerous: 1,
            reason: 'This site is not safe for browsing.',
            reason_header: 'This site is not safe',
          },
        });
        break;
      case 'requestNotVerified':
        setupSecurityProviderMocks(mockServer, {
          statusCode: 401,
          body: {
            message: 'Unauthorized',
          },
        });
        break;
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }
  let windowHandles;
  let extension;
  let popup;
  let testApp;
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };

  it('should return malicious response', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withPreferencesController({
            openSeaEnabled: true,
          })
          .build(),
        ganacheOptions,
        title: this.test.title,
        testSpecificMock: (mockServer) =>
          mockSecurityProviderDetection(mockServer, 'malicious'),
        dapp: true,
        failOnConsoleError: false,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.openNewPage('http://127.0.0.1:8080/');
        windowHandles = await driver.getAllWindowHandles();
        extension = windowHandles[0];

        // Lock Account
        await driver.switchToWindow(extension);
        await driver.clickElement('.account-menu__icon');
        await driver.clickElement({ text: 'Lock', tag: 'button' });

        testApp = windowHandles[1];
        await driver.switchToWindow(testApp);
        // Connect to Dapp1
        await driver.clickElement({ text: 'Connect', tag: 'button' });
        windowHandles = await driver.getAllWindowHandles();

        popup = await driver.switchToWindowWithTitle(
          'MetaMask Notification',
          windowHandles,
        );

        await driver.switchToWindow(popup);
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);
        await driver.clickElement({ text: 'Next', tag: 'button' });
        await driver.clickElement({ text: 'Connect', tag: 'button' });

        await driver.switchToWindow(testApp);
        await driver.clickElement('#personalSign');

        await driver.switchToWindow(popup);

        const warningHeader = await driver.findElement('h5');
        assert.equal(await warningHeader.getText(), 'This could be a scam');
      },
    );
  });
});
