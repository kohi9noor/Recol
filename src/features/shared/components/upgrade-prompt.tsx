import { Crown } from "lucide-react";
import { ERROR_CODES } from "@/constant/messages";

interface UpgradePromptProps {
  error: string | null;
  onCancel: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function UpgradePrompt({
  error,
  onCancel,
  className,
  style,
}: UpgradePromptProps) {
  if (
    error !== ERROR_CODES.SUBSCRIPTION_REQUIRED &&
    error !== ERROR_CODES.DEVICE_LIMIT_REACHED &&
    error !== ERROR_CODES.LIMIT_REACHED
  ) {
    return null;
  }

  const isDeviceLimit = error === ERROR_CODES.DEVICE_LIMIT_REACHED;
  const isLinkLimit = error === ERROR_CODES.LIMIT_REACHED;

  let title = "3 Collections Max";
  let description =
    "You've reached the free limit. Upgrade to Pro to create unlimited collections!";

  if (isDeviceLimit) {
    title = "Device Limit Reached";
    description =
      "You've reached the maximum number of devices. Upgrade to Pro for more!";
  } else if (isLinkLimit) {
    title = "Link Limit Reached";
    description =
      "You've reached the 100 links limit. Upgrade to Pro for unlimited links!";
  }

  return (
    <div
      className={className}
      style={{
        padding: "20px 16px",
        background:
          "linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.02) 100%)",
        border: "1px solid rgba(255, 215, 0, 0.25)",
        borderRadius: "16px",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 215, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Decorative background flare */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "60px",
          height: "60px",
          background: "rgba(255, 215, 0, 0.1)",
          filter: "blur(20px)",
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 215, 0, 0.1)",
            padding: "6px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Crown size={20} color="#FFD700" fill="rgba(255, 215, 0, 0.2)" />
        </div>
        <span
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#FFD700",
            letterSpacing: "0.2px",
          }}
        >
          {title}
        </span>
      </div>
      <p
        style={{
          fontSize: "13px",
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: "20px",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => window.open("https://your-app.com/pricing", "_blank")}
          className="upgrade-btn-premium"
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "#FFD700",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "750",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 215, 0, 0.2)",
            transition: "all 0.2s ease",
          }}
        >
          Upgrade Now
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
