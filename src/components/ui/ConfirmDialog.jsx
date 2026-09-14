import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, title = 'Confirmar exclusão', message, confirmLabel = 'Excluir', onConfirm, onCancel, busy = false }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-ink-2">{message}</p>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} data-autofocus>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
