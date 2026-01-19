import Search from "@/features/search/components/search";

interface SearchFeatureProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchFeature({ isOpen, onClose }: SearchFeatureProps) {
  return <Search open={isOpen} onClose={onClose} />;
}
