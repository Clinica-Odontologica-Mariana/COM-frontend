import { HttpParameterCodec, HttpParams } from '@angular/common/http';

class Utf8HttpParameterCodec implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

const UTF8_CODEC = new Utf8HttpParameterCodec();

export function httpParams(): HttpParams {
  return new HttpParams({ encoder: UTF8_CODEC });
}
