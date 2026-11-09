import EmptyState from './EmptyState'
import { IconAlert } from './Icons'

export default function ErrorAlert({ message, onRetry }) {
  return (
    <EmptyState
      role="alert"
      danger
      icon={<IconAlert size={24} />}
      title="Не удалось загрузить данные"
      text={message}
      action={
        onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Повторить
          </button>
        )
      }
    />
  )
}
