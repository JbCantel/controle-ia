import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Confirmar exclusão', message, confirmLabel = 'Excluir', onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
