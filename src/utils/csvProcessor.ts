import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SalesData } from '../types';

export interface ProcessingResult {
  data: SalesData[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  processedRows: number;
  skippedRows: number;
}

export class CSVProcessor {
  // Common field name variations for flexible mapping
  private static fieldMappings = {
    date: ['date', 'Date', 'DATE', 'sale_date', 'sales_date', 'transaction_date', 'order_date', 'purchase_date'],
    product: ['product', 'Product', 'PRODUCT', 'product_name', 'item', 'Item', 'item_name', 'product_title'],
    category: ['category', 'Category', 'CATEGORY', 'product_category', 'type', 'Type', 'group', 'classification'],
    region: ['region', 'Region', 'REGION', 'location', 'Location', 'territory', 'Territory', 'area', 'zone'],
    salesperson: ['salesperson', 'Salesperson', 'SALESPERSON', 'sales_person', 'sales_rep', 'rep', 'employee', 'agent', 'seller'],
    quantity: ['quantity', 'Quantity', 'QUANTITY', 'qty', 'Qty', 'amount', 'units', 'count'],
    unitPrice: ['unit_price', 'unitPrice', 'Unit_Price', 'price', 'Price', 'unit_cost', 'rate', 'price_per_unit'],
    totalSales: ['total_sales', 'totalSales', 'Total_Sales', 'total', 'Total', 'revenue', 'sales_amount', 'amount'],
    cost: ['cost', 'Cost', 'COST', 'total_cost', 'expense', 'cogs'],
    profit: ['profit', 'Profit', 'PROFIT', 'net_profit', 'margin', 'earnings']
  };

  static async parseFile(file: File): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      data: [],
      errors: [],
      warnings: [],
      totalRows: 0,
      processedRows: 0,
      skippedRows: 0
    };

    try {
      // Check file type and parse accordingly
      const fileExtension = file.name.toLowerCase().split('.').pop();
      let rawData: any[] = [];

      if (fileExtension === 'csv') {
        rawData = await this.parseCSV(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        rawData = await this.parseExcel(file);
      } else {
        result.errors.push(`Unsupported file format: ${fileExtension}. Please upload CSV or Excel files.`);
        return result;
      }

      if (rawData.length === 0) {
        result.errors.push('File appears to be empty or unreadable.');
        return result;
      }

      // Process the raw data
      return this.processRawData(rawData, result);

    } catch (error) {
      result.errors.push(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  private static parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
            if (criticalErrors.length > 0) {
              reject(new Error('File format is not valid CSV'));
              return;
            }
          }
          resolve(results.data as any[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private static parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            reject(new Error('Excel file contains no worksheets'));
            return;
          }
          
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must contain at least a header row and one data row'));
            return;
          }
          
          // Convert to object format with headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const objectData = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          resolve(objectData);
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  private static processRawData(rawData: any[], result: ProcessingResult): ProcessingResult {
    result.totalRows = rawData.length;

    // Find field mappings
    const fieldMap = this.createFieldMap(rawData[0]);
    
    // Check if we have minimum required fields
    const requiredFields = ['product', 'category', 'region', 'salesperson'];
    const availableRequiredFields = requiredFields.filter(field => fieldMap[field]);
    
    if (availableRequiredFields.length < 2) {
      result.errors.push(
        `File must contain at least 2 of these required columns: ${requiredFields.join(', ')}. ` +
        `Found: ${availableRequiredFields.join(', ') || 'none'}`
      );
      return result;
    }

    if (availableRequiredFields.length < 4) {
      result.warnings.push(
        `Some required fields are missing: ${requiredFields.filter(f => !fieldMap[f]).join(', ')}. ` +
        `Default values will be used.`
      );
    }

    // Process each row
    rawData.forEach((row, index) => {
      try {
        const processedRecord = this.processRow(row, fieldMap, index + 1);
        if (processedRecord) {
          result.data.push(processedRecord);
          result.processedRows++;
        } else {
          result.skippedRows++;
        }
      } catch (error) {
        result.warnings.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
        result.skippedRows++;
      }
    });

    // Add summary information
    if (result.processedRows === 0) {
      result.errors.push('No valid data rows could be processed from the file.');
    } else if (result.skippedRows > 0) {
      result.warnings.push(`${result.skippedRows} rows were skipped due to missing or invalid data.`);
    }

    return result;
  }

  private static createFieldMap(sampleRow: any): Record<string, string | null> {
    const availableFields = Object.keys(sampleRow || {});
    const fieldMap: Record<string, string | null> = {};

    // Map each field type to available columns
    Object.entries(this.fieldMappings).forEach(([fieldType, variations]) => {
      fieldMap[fieldType] = null;
      
      for (const variation of variations) {
        const matchingField = availableFields.find(field => 
          field.toLowerCase().trim() === variation.toLowerCase()
        );
        if (matchingField) {
          fieldMap[fieldType] = matchingField;
          break;
        }
      }
    });

    return fieldMap;
  }

  private static processRow(row: any, fieldMap: Record<string, string | null>, rowNumber: number): SalesData | null {
    // Check if row has any meaningful data
    const hasData = Object.values(row).some(value => 
      value !== null && value !== undefined && String(value).trim() !== ''
    );
    
    if (!hasData) {
      return null; // Skip completely empty rows
    }

    // Extract and clean data
    const getValue = (fieldType: string, defaultValue: any = '') => {
      const fieldName = fieldMap[fieldType];
      if (!fieldName || !row[fieldName]) return defaultValue;
      return String(row[fieldName]).trim();
    };

    const getNumericValue = (fieldType: string, defaultValue: number = 0): number => {
      const value = getValue(fieldType, '0');
      if (!value) return defaultValue;
      
      // Clean numeric value (remove currency symbols, commas, etc.)
      const cleanValue = String(value).replace(/[$,€£¥]/g, '').trim();
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Build the record
    const record: SalesData = {
      id: `${Date.now()}-${rowNumber}`,
      date: this.parseDate(getValue('date', new Date().toISOString().split('T')[0])),
      product: getValue('product', 'Unknown Product'),
      category: getValue('category', 'Uncategorized'),
      region: getValue('region', 'Unknown Region'),
      salesperson: getValue('salesperson', 'Unknown Salesperson'),
      quantity: Math.max(1, getNumericValue('quantity', 1)),
      unitPrice: getNumericValue('unitPrice', 0),
      totalSales: getNumericValue('totalSales', 0),
      cost: getNumericValue('cost', 0),
      profit: getNumericValue('profit', 0)
    };

    // Calculate missing values
    if (record.totalSales === 0 && record.quantity > 0 && record.unitPrice > 0) {
      record.totalSales = record.quantity * record.unitPrice;
    }

    if (record.profit === 0 && record.totalSales > 0 && record.cost > 0) {
      record.profit = record.totalSales - record.cost;
    }

    // Validate that we have at least some meaningful data
    const hasRequiredData = record.product !== 'Unknown Product' || 
                           record.category !== 'Uncategorized' || 
                           record.region !== 'Unknown Region' || 
                           record.salesperson !== 'Unknown Salesperson';

    if (!hasRequiredData && record.totalSales === 0) {
      throw new Error('Row contains insufficient data');
    }

    return record;
  }

  private static parseDate(dateString: string): string {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
      // Handle Excel date numbers
      if (/^\d+(\.\d+)?$/.test(dateString.trim())) {
        const excelDate = parseFloat(dateString);
        if (excelDate > 25569) { // Excel epoch starts at 1900-01-01, Unix epoch at 1970-01-01
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          return date.toISOString().split('T')[0];
        }
      }

      // Try different date formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
        /^\d{1,2}-\d{1,2}-\d{4}$/, // M-D-YYYY
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      ];

      const cleanDate = dateString.trim();

      if (formats[0].test(cleanDate)) {
        return cleanDate;
      } else if (formats[1].test(cleanDate) || formats[2].test(cleanDate)) {
        const parts = cleanDate.split(/[\/\-]/);
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }

      // Fallback: try to parse as-is
      const date = new Date(cleanDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      throw new Error('Invalid date format');
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  static generateSampleData(): SalesData[] {
    const products = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Webcam', 'Tablet', 'Phone'];
    const categories = ['Electronics', 'Accessories', 'Peripherals', 'Mobile Devices'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const salespeople = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Davis', 'Tom Brown', 'Emma Wilson'];

    const data: SalesData[] = [];

    for (let i = 0; i < 100; i++) {
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = Math.floor(Math.random() * 500) + 50;
      const totalSales = quantity * unitPrice;
      const cost = totalSales * (0.6 + Math.random() * 0.2); // 60-80% of sales
      const profit = totalSales - cost;

      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      data.push({
        id: `sample-${i}`,
        date: date.toISOString().split('T')[0],
        product: products[Math.floor(Math.random() * products.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        salesperson: salespeople[Math.floor(Math.random() * salespeople.length)],
        quantity,
        unitPrice,
        totalSales,
        cost: Math.round(cost * 100) / 100,
        profit: Math.round(profit * 100) / 100
      });
    }

    return data;
  }
}