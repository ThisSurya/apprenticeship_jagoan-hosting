import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  header: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  header,
  body,
  footer,
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-[#DBE2EF] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-[#112D4E]">{header}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {body}
          </DialogDescription>
        </DialogHeader>
        {footer ? (
          footer
        ) : (
          <DialogFooter className="gap-2 sm:gap-0 mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-xl border-[#DBE2EF] flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-md min-w-[120px] flex-1 sm:flex-none"
            >
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
