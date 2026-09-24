import { TestBed } from '@angular/core/testing';
import { EchoService } from './echo.service';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ParticipantsService } from '@simpl/api-client-authenticationprovider-tier1-v2';

describe('EchoService', () => {
  let echoService: EchoService;
  let participantsService: jest.Mocked<ParticipantsService>;

  beforeEach(() => {
    const mockAgentsService = {
      echo: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        EchoService,
        { provide: ParticipantsService, useValue: mockAgentsService },
      ],
    });

    echoService = TestBed.inject(EchoService);
    participantsService = TestBed.inject(ParticipantsService) as jest.Mocked<ParticipantsService>;
  });

  it('should call agentsService.echo', () => {
    const mockEchoResponse = {
      connectionStatus: 'CONNECTED',
      mtlsStatus: 'SECURED',
    };
    participantsService.echo.mockReturnValue(
      of(mockEchoResponse as unknown as HttpResponse<any>)
    );

    const result = echoService.echo();

    expect(participantsService.echo).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
