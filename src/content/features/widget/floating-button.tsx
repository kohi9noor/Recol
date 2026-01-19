import { BookmarkIcon } from "lucide-react";

interface FloatingButtonProps {
  show: boolean;
  onClick: () => void;
}

export function FloatingButton({ show, onClick }: FloatingButtonProps) {
  if (!show) return null;

  return (
    <div className="extension" onClick={onClick}>
      <BookmarkIcon />
    </div>
  );
}
