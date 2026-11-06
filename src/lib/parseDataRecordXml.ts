/** Parse mock DATA_RECORD-style XML payloads into plain objects. */

const textOf = (el: Element | null): string => (el?.textContent ?? '').trim();

export const decodeXmlText = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();

export const parseDataRecords = <T extends Record<string, string>>(
  xmlText: string,
  fields: Array<keyof T & string>,
): T[] => {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent?.trim() || 'Failed to parse XML');
  }

  return Array.from(doc.querySelectorAll('DATA_RECORD')).map((record) => {
    const row = {} as T;
    for (const field of fields) {
      row[field] = textOf(record.querySelector(field)) as T[typeof field];
    }
    return row;
  });
};

export const fetchDataRecordXml = async <T extends Record<string, string>>(
  url: string,
  fields: Array<keyof T & string>,
): Promise<T[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url} (${res.status})`);
  }
  const xmlText = await res.text();
  return parseDataRecords<T>(xmlText, fields);
};
