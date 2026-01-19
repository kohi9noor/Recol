import { LoginPrompt } from "@/features/auth/components/login-prompt";

interface AuthFeatureProps {
  show: boolean;
  onClose: () => void;
}

export function AuthFeature({ show, onClose }: AuthFeatureProps) {
  return <LoginPrompt show={show} onClose={onClose} />;
}
