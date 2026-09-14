import { useState } from 'react';
import { Database } from 'lucide-react';
import Brand from './Brand';
import DataModal from './DataModal';
import { IconButton } from '../ui/Button';

export default function MobileTopBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
      <Brand />
      <IconButton label="Backup e dados" onClick={() => setOpen(true)}><Database size={18} aria-hidden /></IconButton>
      <DataModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
