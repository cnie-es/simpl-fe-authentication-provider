export const mockedKeyPairsResponse = {
  "self": "/keypairs?name=keypair&creationTimestampFrom=2025-01-20T17:32:28Z&creationTimestampTo=2025-01-25T17:32:28Z&sort=creationTimestamp&page=2&pageSize=2",
  "items": [
    {
      "name": "my keypair",
      "creationTimestamp": "2025-01-23T04:56:07Z",
      "active": false,
      "id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
      "publicKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn6Htd4aaqQ2fmKLhuCz0aLKha31P\nXGMddh8bvMUPFGnUT1ZcRBh+323bzbnu4hZsToMYdYLwz6fOM3C07eiMeA==\n-----END PUBLIC KEY-----",
      "csr": "-----BEGIN CERTIFICATE REQUEST-----\nMIICxTCCAa0CAQAwTDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMQ8wDQYDVQQH\nDAZTYW5Kb3NlMRAwDgYDVQQKDAdNeUNvbXBhbnkxEDAOBgNVBAMMB215Y2VydC5j\nb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC1hrWLEsw9vLkZCHdy\neWcX0Gbd7s0P1qgl2nTspN2bgoctW3gvQAKN7O8r9TFO7hXvvjF2HCEb41CSiFoE\nEgmSvVAOpMtCjMdFctvX3MCABGHYLU5nImLZhTMRdflyoTRJz25uq5hYrfmBdzP4\nnZn4QuYp+h6pRZ07Plq+URrIF4E/c+0N9rwleAVoY9Frn/vwopAhv8l0U6AypS8S\nBlBfZ2MIUXgAWRA1T+n9lgv3X2snFnSxrUqbi4tSPcJDk+7ZcS9M1QetKnPB6ROZ\n1f7xVylTbQ8FzMMhJgNx+iRPLFffYp+iYzC80eTf65U7/ClfGBM4CfdI+TF0nNbf\nWruTAgMBAAGgADANBgkqhkiG9w0BAQsFAAOCAQEALSTjePZKeZspsx+CrcV+hH3u\nWh2gKfr8bA4arZGGzC5ovCfrcK6C6OUKkiVvP9ADv4g5iG0eFmcg2hZsmMJex8sH\ny6x8zbiZ+T9hG66UZS04iEtUqMzjsSCpIWK97e2lZDHwV7Qgvc2sw8QvUnDj6e4D\ngpcEG3KGEp3XnYOBfHrkAfldz7NVyRftrF+y0kC8r/xLZzv9KKToWWAOyxlql2Qi\nKwbtWZAM7gA77RCRUtAhxD/kPlLM2YwQkh0QwRAxVIkKR82DbK90AcBuSmayPbjo\n3eXjfwtrCbb6UVfWn3xAAHYy46D5iFkkq6Y7mOCUNZ7X9uAIKzqJ12plAUoMBxkM\n9g==\n-----END CERTIFICATE REQUEST-----\n"
    },
    {
      "name": "another keypair",
      "creationTimestamp": "2025-01-24T13:00:00Z",
      "active": true,
      "id": "046b6c7f-0b8a-43b9-b35d-6489e6daee92",
      "publicKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn6Htd4aaqQ2fmKLhuCz0aLKha31P\nXGMddh8bvMUPFGnUT1ZcRBh+323bzbnu4hZsToMYdYLwz6fOM3C07eiMeB==\n-----END PUBLIC KEY-----"
    }
  ],
  "pageSize": 2,
  "page": 2,
  "total": 7,
  "first": "/keypairs?name=keypair&creationTimestampFrom=2025-01-20T17:32:28Z&creationTimestampTo=2025-01-25T17:32:28Z&sort=creationTimestamp&page=0&pageSize=2",
  "last": "/keypairs?name=keypair&creationTimestampFrom=2025-01-20T17:32:28Z&creationTimestampTo=2025-01-25T17:32:28Z&sort=creationTimestamp&page=4&pageSize=2",
  "prev": "/keypairs?name=keypair&creationTimestampFrom=2025-01-20T17:32:28Z&creationTimestampTo=2025-01-25T17:32:28Z&sort=creationTimestamp&page=1&pageSize=2",
  "next": "/keypairs?name=keypair&creationTimestampFrom=2025-01-20T17:32:28Z&creationTimestampTo=2025-01-25T17:32:28Z&sort=creationTimestamp&page=3&pageSize=2"
}

export const mockedKeyPairsAlgorithm = {
  "readAlgorithm": "EC",
  "keyLength": 256,
  "signatureAlgorithm": "SHA256withECDSA",
  "algorithm": "ECDSA"
}
