import { useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { ERROR_CODES } from "@/constant/messages";
import { UpgradePrompt } from "@/features/shared/components/upgrade-prompt";

interface AddCollectionFormProps {
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
}

export function AddCollectionForm({
  value,
  onChange,
  onSave,
  onCancel,
  error,
}: AddCollectionFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (
    error === ERROR_CODES.SUBSCRIPTION_REQUIRED ||
    error === ERROR_CODES.DEVICE_LIMIT_REACHED
  ) {
    return <UpgradePrompt error={error} onCancel={onCancel} />;
  }

  return (
    <div className="save-dialog-add-container">
      <div
        className={`save-dialog-add-input-container ${error ? "has-error" : ""}`}
      >
        <input
          ref={inputRef}
          type="text"
          className="save-dialog-add-input"
          placeholder="Name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") onSave();
          }}
        />
        <div className="save-dialog-add-actions">
          <button className="save-dialog-add-action-btn save" onClick={onSave}>
            <Check size={14} />
          </button>
          <button
            className="save-dialog-add-action-btn cancel"
            onClick={onCancel}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {error && <div className="save-dialog-add-error">{error}</div>}
    </div>
  );
}
