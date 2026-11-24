import { Modal } from "@heroui/react";
import { QRCodeCanvas } from "qrcode.react";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/stores/dashboard";
import { IconBlock } from "@/components/IconBlock";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const QR_SIZE = 180;

const QrTile = ({ value, label }: { value: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        className="rounded-xl bg-white p-2 shadow-surface ring-1 ring-border/60 transition-transform active:scale-95"
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        }}
        title={value}
      >
        <QRCodeCanvas value={value} size={QR_SIZE} level="L" />
      </button>
      <span className="text-xs text-muted">{label ?? (copied ? "✓" : "")}</span>
    </div>
  );
};

export const QRCodeDialog: FC = () => {
  const { QRcodeLinks, setQRCode, setSubLink, subscribeUrl } = useDashboard();
  const isOpen = QRcodeLinks !== null;
  const { t } = useTranslation();
  const onClose = () => {
    setQRCode(null);
    setSubLink(null);
  };

  const subscribeQrLink = String(subscribeUrl).startsWith("/")
    ? window.location.origin + subscribeUrl
    : String(subscribeUrl);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <IconBlock>
                <QrCodeIcon className="size-5" />
              </IconBlock>
            </Modal.Header>
            {QRcodeLinks && (
              <Modal.Body className="flex flex-col items-center justify-center gap-6">
                {subscribeUrl && (
                  <div className="flex flex-col items-center">
                    <QrTile value={subscribeQrLink} />
                    <p className="mt-2 block pb-3 text-center">{t("qrcodeDialog.sublink")}</p>
                  </div>
                )}
                <div className="flex w-full max-w-105 flex-col">
                  <div
                    className={cn(
                      "flex max-h-80 w-full flex-wrap items-start justify-center gap-4 overflow-y-auto overflow-x-hidden",
                    )}
                  >
                    {QRcodeLinks.map((link, i) => (
                      <QrTile key={i} value={link} label={`${i + 1}`} />
                    ))}
                  </div>
                </div>
              </Modal.Body>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
