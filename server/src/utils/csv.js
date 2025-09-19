import { parse } from 'csv-parse/sync';

export const parseCsv = async (text) => {
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
};


