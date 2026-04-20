import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ValidationListProps = {
  errors: string[]
}

export function ValidationList({ errors }: ValidationListProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" data-testid="validation-list">
      <AlertTitle>Fix input issues before running</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
