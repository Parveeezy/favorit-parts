export default function EmptyState({ icon, title, text, action, danger = false, role }) {
  return (
    <div className="empty-state" role={role}>
      <div className={`empty-state-icon${danger ? ' is-danger' : ''}`}>{icon}</div>
      <h3 className="h6 mb-1">{title}</h3>
      {text && <p className="small text-body-secondary mb-3">{text}</p>}
      {action}
    </div>
  )
}
