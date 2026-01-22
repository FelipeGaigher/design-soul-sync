type FormErrorProps = {
  message?: string | null;
  className?: string;
};

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={`text-xs font-medium text-destructive ${className}`} role="alert" aria-live="polite">
      {message}
    </p>
  );
}
