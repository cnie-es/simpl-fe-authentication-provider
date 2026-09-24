import { render } from "@testing-library/angular";
import { EchoComponent } from "./echo.component";
import { TranslocoTestingModule } from "@jsverse/transloco";
import { Echo } from '@simpl/api-client-authenticationprovider-v1';
import en from "../../../assets/i18n/en.json";

const baseEchoResponse: Echo = {
  id: 'UNIT_12345',
  username: 't_foo',
  connectionStatus: 'CONNECTED',
  mtlsStatus: 'SECURED',
  participantType: 'CONSUMER', // This needs to be non-optional
  organization: 'Foo Organization',
  email: 'faa_outcome@email.com',
  userIdentityAttributes: ['CodeIA_004', 'CodeIA_005'],
  identityAttributes: [
    {
      code: 'ia_code',
      name: 'ia_name',
      description: 'first testing ia',
      assignableToRoles: true,
      enabled: true,
      used: true,
      id: '',
      right: false,
    },
  ],
  credentialId: '',
  expiryDate: '',
};

describe("EchoComponent", () => {
  it("should create", async () => {
    const component = await render(EchoComponent, {
      imports: [
        TranslocoTestingModule.forRoot({
          translocoConfig: {
            availableLangs: ["en"],
            defaultLang: "en",
          },
          langs: {
            en: en
          }
        }),
      ],
      inputs: {
        echoResponse: {
          ...baseEchoResponse,
          username: "one_bar_username",
          email: "one_bar@email.com",
        },
      },
    });
    expect(component).toBeTruthy();
  });

  // Rest of the test remains the same
});
