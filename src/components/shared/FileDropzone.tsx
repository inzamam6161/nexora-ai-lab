import {
  File,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

type FileDropzoneProps = {
  accept: string;
  acceptedExtensions: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
};

export default function FileDropzone({
  accept,
  acceptedExtensions,
  maxSizeMB = 10,
  multiple = false,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  function validateFiles(
    files: File[]
  ) {
    const maxBytes =
      maxSizeMB * 1024 * 1024;

    for (const file of files) {
      const extension =
        `.${file.name
          .split(".")
          .pop()
          ?.toLowerCase()}`;

      if (
        !acceptedExtensions.includes(
          extension
        )
      ) {
        return `Unsupported file type: ${extension}`;
      }

      if (file.size > maxBytes) {
        return `${file.name} is larger than ${maxSizeMB} MB.`;
      }
    }

    return null;
  }

  function handleFiles(
    fileList: FileList | null
  ) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);

    const finalFiles = multiple
      ? files
      : files.slice(0, 1);

    const validationError =
      validateFiles(finalFiles);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFiles(finalFiles);

    onFilesSelected(finalFiles);
  }

  function removeFile(
    fileName: string
  ) {
    const updated =
      selectedFiles.filter(
        (file) =>
          file.name !== fileName
      );

    setSelectedFiles(updated);
    onFilesSelected(updated);
  }

  return (
    <div className="file-upload">
      <div
        className={
          isDragging
            ? "file-dropzone file-dropzone--dragging"
            : "file-dropzone"
        }
        role="button"
        tabIndex={0}
        onClick={() =>
          inputRef.current?.click()
        }
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          handleFiles(
            event.dataTransfer.files
          );
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          onChange={(event) => {
            handleFiles(
              event.target.files
            );

            event.target.value = "";
          }}
        />

        <div className="file-dropzone__icon">
          <UploadCloud size={24} />
        </div>

        <strong>
          Drop your file here
        </strong>

        <p>
          or click to browse
        </p>

        <span>
          {acceptedExtensions
            .map((item) =>
              item
                .replace(".", "")
                .toUpperCase()
            )
            .join(" · ")}
          {" · "}
          Max {maxSizeMB} MB
        </span>
      </div>

      {error && (
        <div
          className="file-upload__error"
          role="alert"
        >
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="file-list">
          {selectedFiles.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              className="file-item"
            >
              <div className="file-item__icon">
                <File size={17} />
              </div>

              <div className="file-item__info">
                <strong>
                  {file.name}
                </strong>

                <span>
                  {formatFileSize(
                    file.size
                  )}
                </span>
              </div>

              <button
                type="button"
                className="file-item__remove"
                aria-label={`Remove ${file.name}`}
                onClick={(event) => {
                  event.stopPropagation();

                  removeFile(
                    file.name
                  );
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;

  return `${mb.toFixed(1)} MB`;
}