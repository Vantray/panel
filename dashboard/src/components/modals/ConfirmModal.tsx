import { Button, Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";
import type { FC, ReactNode } from "react";
import { IconBlock } from "@/components/IconBlock";

export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  prompt: ReactNode;
  confirmLabel: string;
  tone?: "accent" | "danger";
  icon: ReactNode;
};

/** Controlled confirm dialog used by delete / reset / revoke flows. */
export const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  prompt,
  confirmLabel,
  tone = "danger",
  icon,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog className="sm:max-w-sm">
            <Modal.CloseTrigger />
            <Modal.Header>
              <IconBlock tone={tone}>{icon}</IconBlock>
            </Modal.Header>
            <Modal.Body>
              <p className="text-lg font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{prompt}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button size="sm" variant="outline" fullWidth onPress={onClose}>
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                fullWidth
                variant={tone === "danger" ? "danger" : "primary"}
                isPending={loading}
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
