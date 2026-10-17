/**
 * Utilidades oficiales para validación y formateo de RUT chileno
 * Compatible con formato estándar nacional: XX.XXX.XXX-X (7 a 9 dígitos en total)
 */

export function cleanRut(rut: string): string {
  if (!rut) return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Calcula el dígito verificador chileno usando algoritmo Módulo 11
 */
export function calculateDv(rutBody: number | string): string {
  const cleanBody = rutBody.toString().replace(/[^0-9]/g, '');
  if (!cleanBody) return '';
  
  let sum = 0;
  let multiplier = 2;

  for (let i = cleanBody.length - 1; i >= 0; i--) {
    sum += parseInt(cleanBody[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return remainder.toString();
}

/**
 * Valida si un RUT chileno es válido tanto en formato como en dígito verificador
 */
export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 8 || cleaned.length > 9) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  return calculateDv(body) === dv;
}

/**
 * Formatea un RUT al estándar chileno oficial con puntos y guion.
 * Ejemplos:
 *   "123456785" -> "12.345.678-5"
 *   "223456786" -> "22.345.678-6"
 *   "8123456K"  -> "8.123.456-K"
 */
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;

  const dv = cleaned.slice(-1);
  const body = cleaned.slice(0, -1);

  // Formatear el cuerpo con separador de miles
  let formattedBody = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    count++;
    formattedBody = body[i] + formattedBody;
    if (count % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }

  return `${formattedBody}-${dv}`;
}

/**
 * Compara si dos RUTs corresponden a la misma persona ignorando puntos, guion y mayúsculas
 */
export function isSameRut(rutA?: string, rutB?: string): boolean {
  if (!rutA || !rutB) return false;
  return cleanRut(rutA) === cleanRut(rutB);
}
