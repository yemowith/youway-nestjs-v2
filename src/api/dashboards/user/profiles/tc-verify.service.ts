import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { parseString } from 'xml2js';

const tcVerifySchema = z.object({
  tc: z
    .string()
    .min(11, 'TC kimlik 11 karakterden oluşmalıdır.')
    .max(11, 'TC kimlik 11 karakterden oluşmalıdır.')
    .regex(/^[0-9]*$/, 'TC kimlik sadece rakamlar içermelidir.')
    .nonempty('Boş bırakmayın.'),
  ad: z
    .string()
    .min(2, 'Minimum 2 karakter.')
    .max(50, 'Maksimum 50 karakter.')
    .nonempty('Boş bırakmayın.'),
  soyad: z
    .string()
    .min(2, 'Minimum 2 karakter.')
    .max(50, 'Maksimum 50 karakter.')
    .nonempty('Boş bırakmayın.'),
  dogumYili: z
    .number()
    .min(1900, 'Geçersiz doğum yılı.')
    .max(new Date().getFullYear(), 'Geçersiz doğum yılı.'),
});

type TCVerifyRequest = z.infer<typeof tcVerifySchema>;

interface TCVerifyResponse {
  status: 'success' | 'error';
  result?: boolean;
  legalAge?: boolean;
  details?: string | z.ZodIssue[];
}

interface SOAPResponse {
  'soap:Envelope': {
    'soap:Body': Array<{
      TCKimlikNoDogrulaResponse: Array<{
        TCKimlikNoDogrulaResult: string[];
      }>;
    }>;
  };
}

@Injectable()
export class TCVerifyService {
  private getAge(birthYear: number): boolean {
    const today = new Date();
    const birthDate = new Date(birthYear, 0, 1); // January 1st of birth year
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }

  async verifyTCKimlik(data: {
    tc: string;
    ad: string;
    soyad: string;
    dogumYili: number;
  }): Promise<TCVerifyResponse> {
    try {
      // Validate input data
      const validatedData = tcVerifySchema.parse(data);
      const legalAge = this.getAge(validatedData.dogumYili);

      // Prepare SOAP request
      const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${validatedData.tc}</TCKimlikNo>
      <Ad>${validatedData.ad}</Ad>
      <Soyad>${validatedData.soyad}</Soyad>
      <DogumYili>${validatedData.dogumYili}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

      const fetchUrl = new URL(
        'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx?op=TCKimlikNoDogrula',
      );

      const headers = new Headers();
      headers.set('Content-Type', 'text/xml; charset=utf-8');
      headers.set('Content-Length', Buffer.byteLength(xmlBody).toString());

      const fetchOptions: RequestInit = {
        method: 'POST',
        headers,
        body: xmlBody,
      };

      const fetchResponse = await fetch(fetchUrl, fetchOptions);
      const xmlResponse = await fetchResponse.text();

      return new Promise((resolve) => {
        parseString(xmlResponse, (err: Error | null, result: SOAPResponse) => {
          if (err) {
            resolve({
              status: 'error',
              details: 'Xml ayrıştırması yapılamadı.',
            });
            return;
          }

          try {
            const TCKimlikNoDogrulaResult =
              result['soap:Envelope']['soap:Body'][0][
                'TCKimlikNoDogrulaResponse'
              ][0]['TCKimlikNoDogrulaResult'][0];

            if (
              TCKimlikNoDogrulaResult !== 'true' &&
              TCKimlikNoDogrulaResult !== 'false'
            ) {
              resolve({
                status: 'error',
                details: 'Beklenmeyen yanıt formatı.',
              });
            }

            if (TCKimlikNoDogrulaResult === 'false') {
              resolve({
                status: 'success',
                result: false,
                details: 'TC Kimlik doğrulama başarısız.',
                legalAge,
              });
            }

            resolve({
              status: 'success',
              result: TCKimlikNoDogrulaResult === 'true',
              details: 'TC Kimlik doğrulama başarılı.',
              legalAge,
            });
          } catch (error) {
            resolve({
              status: 'error',
              details: 'Beklenmeyen yanıt formatı.',
            });
          }
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          status: 'error',
          details: error.issues,
        };
      }

      return {
        status: 'error',
        details: 'TC Kimlik doğrulama işlemi sırasında bir hata oluştu.',
      };
    }
  }
}
