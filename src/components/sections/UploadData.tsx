import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, AlertTriangle, Download, Plus, Save } from 'lucide-react';
import { UploadedFile, SalesData } from '../../types';
import { CSVProcessor, ProcessingResult } from '../../utils/csvProcessor';

interface UploadDataProps {
  onDataUpload: (data: SalesData[]) => void;
}

const UploadData: React.FC<UploadDataProps> = ({ onDataUpload }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [manualEntry, setManualEntry] = useState<Partial<SalesData>>({
    date: new Date().toISOString().split('T')[0],
    product: '',
    category: '',
    region: '',
    salesperson: '',
    quantity: 1,
    unitPrice: 0,
    cost: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setIsUploading(true);
    setProcessingResult(null);
    
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      uploadDate: new Date().toLocaleString(),
      recordCount: 0,
      status: 'processing'
    };

    setUploadedFiles(prev => [newFile, ...prev]);

    try {
      const result = await CSVProcessor.parseFile(file);
      setProcessingResult(result);
      
      if (result.errors.length > 0 && result.data.length === 0) {
        // Complete failure
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'error' }
              : f
          )
        );
      } else {
        // Success or partial success
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'completed', recordCount: result.data.length }
              : f
          )
        );

        if (result.data.length > 0) {
          onDataUpload(result.data);
        }
      }
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'error' }
            : f
        )
      );
      setProcessingResult({
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
        totalRows: 0,
        processedRows: 0,
        skippedRows: 0
      });
      console.error('Error processing CSV:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const generateSampleData = () => {
    const sampleData = CSVProcessor.generateSampleData();
    onDataUpload(sampleData);
    
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: 'sample-data.csv',
      uploadDate: new Date().toLocaleString(),
      recordCount: sampleData.length,
      status: 'completed'
    };
    
    setUploadedFiles(prev => [newFile, ...prev]);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!manualEntry.product || !manualEntry.category || !manualEntry.region || !manualEntry.salesperson) {
        alert('Please fill in all required fields');
        return;
      }

      // Calculate derived fields
      const totalSales = (manualEntry.quantity || 0) * (manualEntry.unitPrice || 0);
      const profit = totalSales - (manualEntry.cost || 0);

      const newRecord: SalesData = {
        id: `manual-${Date.now()}`,
        date: manualEntry.date || new Date().toISOString().split('T')[0],
        product: manualEntry.product || '',
        category: manualEntry.category || '',
        region: manualEntry.region || '',
        salesperson: manualEntry.salesperson || '',
        quantity: manualEntry.quantity || 1,
        unitPrice: manualEntry.unitPrice || 0,
        totalSales,
        cost: manualEntry.cost || 0,
        profit
      };

      // Add to dataset
      onDataUpload([newRecord]);

      // Add to upload history
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: `Manual Entry - ${newRecord.product}`,
        uploadDate: new Date().toLocaleString(),
        recordCount: 1,
        status: 'completed'
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);

      // Reset form
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        product: '',
        category: '',
        region: '',
        salesperson: '',
        quantity: 1,
        unitPrice: 0,
        cost: 0
      });

      alert('Sales record added successfully!');
    } catch (error) {
      console.error('Error adding manual entry:', error);
      alert('Error adding sales record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SalesData, value: string | number) => {
    setManualEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      case 'processing':
        return 'Processing...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Upload</h2>
        <p className="text-gray-600 dark:text-slate-300">Upload CSV files or manually enter sales data for analysis</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload CSV Files
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Manual Entry
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Upload CSV Files
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 mb-4">
                    Drag and drop your CSV files here, or click to browse
                  </p>
                  
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Processing...' : 'Choose Files'}
                  </button>
                </div>

                {/* Processing Results */}
                {processingResult && (
                  <div className="mt-4 space-y-3">
                    {processingResult.errors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="font-semibold text-red-900">Errors</h4>
                        </div>
                        <ul className="text-sm text-red-800 space-y-1">
                          {processingResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {processingResult.warnings.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                          <h4 className="font-semibold text-yellow-900">Warnings</h4>
                        </div>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {processingResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {processingResult.data.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <h4 className="font-semibold text-green-900">Success</h4>
                        </div>
                        <p className="text-sm text-green-800">
                          Successfully processed {processingResult.processedRows} out of {processingResult.totalRows} rows.
                          {processingResult.skippedRows > 0 && ` ${processingResult.skippedRows} rows were skipped.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">File Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls)</li>
                    <li>• <strong>Minimum required:</strong> At least 2 of these columns: product, category, region, salesperson</li>
                    <li>• <strong>Optional columns:</strong> date, quantity, unit_price, total_sales, cost, profit</li>
                    <li>• <strong>Flexible naming:</strong> Recognizes common column name variations</li>
                    <li>• <strong>Data handling:</strong> Missing data filled with defaults, extra columns ignored</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Start</h3>
                  <p className="text-gray-600 dark:text-slate-300 mb-4">
                    Don't have data yet? Generate sample data to explore the dashboard features.
                  </p>
                  <button
                    onClick={generateSampleData}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate Sample Data</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add New Sales Record</h3>
                <p className="text-gray-600 dark:text-slate-300">Enter sales data manually to add individual records to your dataset</p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={manualEntry.date || ''}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualEntry.product || ''}
                      onChange={(e) => handleInputChange('product', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualEntry.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Electronics, Accessories"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualEntry.region || ''}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., North, South, East, West"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salesperson <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualEntry.salesperson || ''}
                      onChange={(e) => handleInputChange('salesperson', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter salesperson name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualEntry.quantity || 1}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={manualEntry.unitPrice || 0}
                      onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={manualEntry.cost || 0}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Calculated Fields Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Calculated Values</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-300">Total Sales:</span>
                      <span className="font-medium">
                        ${((manualEntry.quantity || 0) * (manualEntry.unitPrice || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-300">Profit:</span>
                      <span className="font-medium">
                        ${(((manualEntry.quantity || 0) * (manualEntry.unitPrice || 0)) - (manualEntry.cost || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setManualEntry({
                      date: new Date().toISOString().split('T')[0],
                      product: '',
                      category: '',
                      region: '',
                      salesperson: '',
                      quantity: 1,
                      unitPrice: 0,
                      cost: 0
                    })}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'Adding...' : 'Add Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Entry History</h3>
          <p className="text-gray-600 dark:text-slate-300">Track your uploaded files and manual entries</p>
        </div>

        <div className="p-6">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-300">No data entries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {file.name.startsWith('Manual Entry') ? (
                      <Plus className="h-8 w-8 text-green-500" />
                    ) : file.name.toLowerCase().includes('.xlsx') || file.name.toLowerCase().includes('.xls') ? (
                      <FileText className="h-8 w-8 text-green-600" />
                    ) : (
                      <FileText className="h-8 w-8 text-blue-500" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        {file.name.startsWith('Manual Entry') ? 'Added' : 'Uploaded'} {file.uploadDate}
                        {file.recordCount > 0 && ` • ${file.recordCount.toLocaleString()} records`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(file.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadData;
