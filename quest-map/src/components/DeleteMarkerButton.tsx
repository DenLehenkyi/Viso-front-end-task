export default function DeleteMarker({ onDelete }: { onDelete: () => void }) {
  return (
    <button id="deleteButton" onClick={onDelete}>
      Видалити
    </button>
  );
}
