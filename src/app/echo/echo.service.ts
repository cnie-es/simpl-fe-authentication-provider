import { inject, Injectable } from '@angular/core';
import { ParticipantsService } from '@simpl/api-client-authenticationprovider-tier1-v2';

export interface IdentityAttributeDTO {
  code: string;
  name: string;
  description: string;
  assignableToRoles: boolean;
  enabled: boolean;
  participantTypes: string[];
  used: boolean;
}

export interface EchoTResponseDTO {
    id?: string,
    username?: string,
    userRole?: string[],
    commonName?: string,
    connectionStatus?: 'CONNECTED' | 'NOT_CONNECTED',
    mtlsStatus?: 'SECURED' | 'NOT_SECURED',
    email?: string,
    userEmail?: string,
    participantType?: string,
    organization?: string,
    status?: string,
    outcomeUserEmail?: string,
    certificateId?: string,
    identityAttributes?: IdentityAttributeDTO[]
    userIdentityAttributes?: string[],
}

@Injectable({ providedIn: "root" })
export class EchoService {

  private readonly _participantsService = inject(ParticipantsService);

    echo() {
        return this._participantsService.echo();
    }
}
