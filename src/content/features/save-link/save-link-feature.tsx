import { SaveDialog } from "@/features/save-link/components";

interface SaveLinkFeatureProps {
  isOpen: boolean;
  linkId?: string;
  error?: string;
  onClose: () => void;
}

export function SaveLinkFeature({
  isOpen,
  linkId,
  error,
  onClose,
}: SaveLinkFeatureProps) {
  return (
    <SaveDialog
      open={isOpen}
      linkId={linkId}
      initialError={error}
      onClose={onClose}
    />
  );
}
