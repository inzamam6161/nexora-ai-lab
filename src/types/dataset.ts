export type DataValue =
  | string
  | number
  | boolean
  | Date
  | null;

export type DataRow =
  Record<string, DataValue>;

export type ParsedDataset = {
  fileName: string;
  sheetName: string;
  columns: string[];
  rows: DataRow[];
  rowCount: number;
};