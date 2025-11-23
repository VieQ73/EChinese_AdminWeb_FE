import React, { useState, useCallback } from "react";
import Modal from "../../../../components/Modal";
import { Button } from "../../../../components/ui/Button";
import { readImportFile } from "../../../../utils/importUtils";
import { Vocabulary } from "../../../../types";

interface ImportVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Partial<Vocabulary>[]) => void;
  isLoading: boolean;
}

export const ImportVocabModal: React.FC<ImportVocabModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Invalid file type. Please select a CSV or Excel file.");
        setFile(null);
      }
    }
  };

  const handleImportClick = useCallback(async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }
    try {
      const data = await readImportFile(file);
      if (data.length === 0) {
        setError("The file is empty or could not be parsed correctly.");
        return;
      }
      onImport(data);
    } catch (err) {
      setError("An error occurred while reading the file.");
      console.error(err);
    }
  }, [file, onImport]);

  const handleClose = () => {
    setFile(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Vocabularies from File"
      className="max-w-lg"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            Select File (.csv, .xls, .xlsx)
          </label>
          <div className="mt-1 flex items-center">
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {file && <p className="mt-2 text-sm text-gray-500">{file.name}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleImportClick}
            disabled={!file || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
