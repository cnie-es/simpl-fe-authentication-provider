import { render } from '@testing-library/angular';
import { EchoTierHomeComponent } from './echo-tier-home.component';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from "../../../assets/i18n/en.json";

jest.mock('../echo.service');

beforeEach(() => {
  jest.resetAllMocks();
});

async function renderComponent(role?: string) {
  return await render(EchoTierHomeComponent, {
    imports: [
      TranslocoTestingModule.forRoot(
        {
          translocoConfig: {
            availableLangs: ["en"],
            defaultLang: "en",
          },
          langs: {
            en: en
          }
        }
      ),
    ]
  });
}

describe("EchoTierHomeComponent", () => {
  it("should render", async () => {
    await renderComponent("ONBOARDER_M");
  });
});
