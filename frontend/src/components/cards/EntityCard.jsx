import SecondaryButton from "../common/SecondaryButton";

function EntityCard({
  thumbnail,
  icon: Icon,
  title,
  subtitle,
  status,
  statusColor = "yellow",
  score,
  date,
  badgeCount,
  badgeLabel,
  footer,
  children,
  actionText,
  onAction,
}) {
  const statusStyles = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-sm
        overflow-hidden
        hover:shadow-lg
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="
            w-full
            h-48
            object-cover
          "
        />
      )}

      <div className="p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className="
        w-10 h-10
        rounded-xl
        bg-indigo-100
        flex items-center justify-center
      "
              >
                <Icon size={20} className="text-indigo-600" />
              </div>
            )}

            <div>
              <h3
                className="
        text-lg
        font-bold
        text-gray-800
      "
              >
                {title}
              </h3>

              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>

          {status && (
            <span
              className={`
                px-3
                py-1
                rounded-xl
                text-xs
                font-semibold
                ${statusStyles[statusColor]}
              `}
            >
              {status}
            </span>
          )}
        </div>

        {score !== undefined && score !== null && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Score</span>

            <div
              className="
                text-2xl
                font-bold
                text-indigo-600
              "
            >
              {score}%
            </div>
          </div>
        )}
        {date && (
          <div className="mt-3">
            <p
              className="
        text-sm
        text-gray-500
      "
            >
              {date}
            </p>
          </div>
        )}
        {badgeCount !== undefined && (
          <div className="mt-3">
            <div
              className="
        inline-flex
        items-center
        gap-2
        px-3
        py-1
        rounded-full
        bg-indigo-100
        text-indigo-700
        text-sm
        font-semibold
      "
            >
              <span>{badgeCount}</span>
              {badgeLabel && <span>{badgeLabel}</span>}
            </div>
          </div>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-4">{footer}</div>}
        {actionText && (
          <div className="mt-6">
            <SecondaryButton onClick={onAction} className="w-full">
              {actionText}
            </SecondaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default EntityCard;
