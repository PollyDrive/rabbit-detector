export interface ZonePopoverProps {
  location: string;
  onClose: () => void;
}

export function ZonePopover({ location, onClose }: ZonePopoverProps) {
  return (
    <dialog open aria-label="Ручной ввод" className="zone-popover">
      <h2>Ручной ввод</h2>
      <div>
        <input readOnly value={location} />
      </div>
      <button onClick={onClose}>Закрыть</button>
    </dialog>
  )
}
