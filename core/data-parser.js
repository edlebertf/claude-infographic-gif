/**
 * Data Parser
 * Parse and validate various input formats for infographic generation
 */

class DataParser {
  /**
   * Parse CSV string into structured data
   */
  static parseCSV(csvString, options = {}) {
    const {
      delimiter = ',',
      hasHeaders = true,
      trimValues = true
    } = options;

    const lines = csvString.trim().split(/\r?\n/);
    if (lines.length === 0) {
      throw new Error('CSV is empty');
    }

    const parseRow = (row) => {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          values.push(trimValues ? current.trim() : current);
          current = '';
        } else {
          current += char;
        }
      }
      values.push(trimValues ? current.trim() : current);
      return values;
    };

    const rows = lines.map(parseRow);

    if (hasHeaders) {
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      return { headers, data, raw: rows };
    }

    return { headers: null, data: rows, raw: rows };
  }

  /**
   * Parse JSON input (handles various formats)
   */
  static parseJSON(input) {
    let data;

    if (typeof input === 'string') {
      try {
        data = JSON.parse(input);
      } catch (e) {
        throw new Error(`Invalid JSON: ${e.message}`);
      }
    } else {
      data = input;
    }

    return data;
  }

  /**
   * Convert key-value pairs to chart data
   */
  static parseKeyValue(input) {
    if (Array.isArray(input)) {
      // Array of {label, value} objects
      return input.map(item => ({
        label: String(item.label || item.name || item.key || ''),
        value: DataParser.parseNumber(item.value || item.amount || 0)
      }));
    }

    if (typeof input === 'object') {
      // Plain object { key: value }
      return Object.entries(input).map(([label, value]) => ({
        label,
        value: DataParser.parseNumber(value)
      }));
    }

    throw new Error('Invalid key-value format');
  }

  /**
   * Parse a number from various formats
   */
  static parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols, commas, percentage signs
      const cleaned = value.replace(/[$€£¥,]/g, '').replace(/%$/, '');
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        throw new Error(`Cannot parse number: ${value}`);
      }
      return num;
    }
    return 0;
  }

  /**
   * Auto-detect and parse input format
   */
  static autoDetect(input) {
    if (typeof input === 'string') {
      const trimmed = input.trim();

      // Check for JSON
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return { type: 'json', data: DataParser.parseJSON(trimmed) };
      }

      // Check for CSV (has newlines and consistent delimiters)
      if (trimmed.includes('\n') && (trimmed.includes(',') || trimmed.includes('\t'))) {
        const delimiter = trimmed.includes('\t') ? '\t' : ',';
        return { type: 'csv', data: DataParser.parseCSV(trimmed, { delimiter }) };
      }

      // Try JSON anyway (might be inline)
      try {
        return { type: 'json', data: DataParser.parseJSON(trimmed) };
      } catch {
        throw new Error('Could not auto-detect input format');
      }
    }

    if (typeof input === 'object') {
      return { type: 'object', data: input };
    }

    throw new Error('Unsupported input type');
  }

  /**
   * Validate data for specific chart types
   */
  static validateForChart(data, chartType) {
    const validators = {
      'bar': DataParser.validateBarChartData,
      'pie': DataParser.validatePieChartData,
      'counter': DataParser.validateCounterData,
      'progress': DataParser.validateProgressData,
      'timeline': DataParser.validateTimelineData
    };

    const validator = validators[chartType];
    if (!validator) {
      throw new Error(`Unknown chart type: ${chartType}`);
    }

    return validator(data);
  }

  /**
   * Validate bar chart data
   */
  static validateBarChartData(data) {
    const errors = [];

    if (!data || (!Array.isArray(data) && !data.data)) {
      errors.push('Data must be an array or object with data property');
      return { valid: false, errors };
    }

    const items = Array.isArray(data) ? data : (data.data || []);

    if (items.length === 0) {
      errors.push('Data must have at least one item');
    }

    if (items.length > 20) {
      errors.push('Too many items (max 20 for readability)');
    }

    items.forEach((item, i) => {
      if (!item.label && !item.name && !item.category) {
        errors.push(`Item ${i + 1} is missing a label`);
      }
      const value = item.value ?? item.amount ?? item.count;
      if (value === undefined || value === null) {
        errors.push(`Item ${i + 1} is missing a value`);
      }
    });

    return { valid: errors.length === 0, errors, normalized: items };
  }

  /**
   * Validate pie chart data
   */
  static validatePieChartData(data) {
    const result = DataParser.validateBarChartData(data);

    if (result.valid && result.normalized) {
      const total = result.normalized.reduce((sum, item) => {
        return sum + DataParser.parseNumber(item.value ?? item.amount ?? 0);
      }, 0);

      if (total <= 0) {
        result.errors.push('Total of all values must be greater than 0');
        result.valid = false;
      }
    }

    return result;
  }

  /**
   * Validate counter data
   */
  static validateCounterData(data) {
    const errors = [];

    if (typeof data === 'number') {
      return { valid: true, errors: [], normalized: { value: data } };
    }

    if (typeof data === 'object') {
      const value = data.value ?? data.amount ?? data.number ?? data.count;
      if (value === undefined || value === null) {
        errors.push('Counter data must have a value property');
      }
      return {
        valid: errors.length === 0,
        errors,
        normalized: {
          value: DataParser.parseNumber(value),
          label: data.label || data.title || '',
          prefix: data.prefix || '',
          suffix: data.suffix || data.unit || ''
        }
      };
    }

    errors.push('Counter data must be a number or object');
    return { valid: false, errors };
  }

  /**
   * Validate progress bar data
   */
  static validateProgressData(data) {
    const errors = [];

    if (!data) {
      errors.push('Data is required');
      return { valid: false, errors };
    }

    const items = Array.isArray(data) ? data : (data.metrics || data.items || data.data || [data]);

    if (items.length === 0) {
      errors.push('At least one progress item is required');
    }

    if (items.length > 10) {
      errors.push('Too many items (max 10 for readability)');
    }

    const normalized = items.map((item, i) => {
      const value = DataParser.parseNumber(item.value ?? item.progress ?? item.percent ?? 0);

      if (value < 0 || value > 100) {
        errors.push(`Item ${i + 1} value must be between 0 and 100`);
      }

      return {
        label: item.label || item.name || `Item ${i + 1}`,
        value: Math.min(100, Math.max(0, value)),
        unit: item.unit || '%'
      };
    });

    return { valid: errors.length === 0, errors, normalized };
  }

  /**
   * Validate timeline data
   */
  static validateTimelineData(data) {
    const errors = [];

    if (!data) {
      errors.push('Data is required');
      return { valid: false, errors };
    }

    const items = Array.isArray(data) ? data : (data.events || data.items || data.data || []);

    if (items.length === 0) {
      errors.push('At least one timeline event is required');
    }

    if (items.length > 10) {
      errors.push('Too many events (max 10 for readability)');
    }

    const normalized = items.map((item, i) => ({
      date: item.date || item.time || item.year || `Event ${i + 1}`,
      title: item.title || item.label || item.name || '',
      description: item.description || item.text || ''
    }));

    normalized.forEach((item, i) => {
      if (!item.title) {
        errors.push(`Event ${i + 1} is missing a title`);
      }
    });

    return { valid: errors.length === 0, errors, normalized };
  }

  /**
   * Normalize data for chart rendering
   */
  static normalizeChartData(data, chartType) {
    const validation = DataParser.validateForChart(data, chartType);

    if (!validation.valid) {
      throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
    }

    return validation.normalized;
  }

  /**
   * Extract title from data if present
   */
  static extractTitle(data) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      return data.title || data.name || data.heading || null;
    }
    return null;
  }

  /**
   * Extract subtitle/description from data
   */
  static extractSubtitle(data) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      return data.subtitle || data.description || data.subheading || null;
    }
    return null;
  }

  /**
   * Format number for display
   */
  static formatNumber(num, options = {}) {
    const {
      decimals = 0,
      prefix = '',
      suffix = '',
      thousandsSeparator = ',',
      decimalSeparator = '.'
    } = options;

    const fixed = num.toFixed(decimals);
    const [integer, decimal] = fixed.split('.');

    const formattedInt = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    const formatted = decimal ? `${formattedInt}${decimalSeparator}${decimal}` : formattedInt;

    return `${prefix}${formatted}${suffix}`;
  }

  /**
   * Calculate max value for scaling
   */
  static getMaxValue(data) {
    if (Array.isArray(data)) {
      return Math.max(...data.map(item =>
        DataParser.parseNumber(item.value ?? item.amount ?? item.count ?? 0)
      ));
    }
    return 0;
  }

  /**
   * Calculate sum of values
   */
  static getSum(data) {
    if (Array.isArray(data)) {
      return data.reduce((sum, item) =>
        sum + DataParser.parseNumber(item.value ?? item.amount ?? item.count ?? 0)
      , 0);
    }
    return 0;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataParser;
}
