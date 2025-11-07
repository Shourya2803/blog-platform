"use client";

import React from "react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

export const ConfirmDialog: React.FC<Props> = ({
  open,
  title = "Confirm",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirmAction,
  onCancelAction,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
  <div className="absolute inset-0 bg-black/40" onClick={onCancelAction} />

      <div className="bg-white dark:bg-zinc-900 rounded-md p-6 z-50 max-w-lg w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancelAction}
            className="px-3 py-1 rounded-md bg-white dark:bg-zinc-800 border text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirmAction}
            className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
