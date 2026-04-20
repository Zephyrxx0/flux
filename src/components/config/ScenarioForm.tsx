import { zodResolver } from "@hookform/resolvers/zod"
import { memo, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { StadiumSim } from "@/simulation/adapters/StadiumSim"
import {
  SimulationInputSchema,
  type SimulationInput,
} from "@/simulation/contracts/input.schema"
import { useScenarioStore } from "@/hooks/useScenarioStore"
import { ValidationList } from "./ValidationList"

type ScenarioRowProps = {
  label: string
  children: React.ReactNode
}

const ScenarioRow = memo(function ScenarioRow({ label, children }: ScenarioRowProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  )
})

function collectErrorMessages(errors: FieldErrors<SimulationInput>, prefix = ""): string[] {
  const messages: string[] = []

  for (const [key, value] of Object.entries(errors)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key

    if (!value) {
      continue
    }

    if (typeof value === "object" && "message" in value && value.message) {
      messages.push(`${nextPrefix}: ${String(value.message)}`)
      continue
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          messages.push(...collectErrorMessages(item as FieldErrors<SimulationInput>, `${nextPrefix}[${index}]`))
        }
      })
      continue
    }

    if (typeof value === "object") {
      messages.push(...collectErrorMessages(value as FieldErrors<SimulationInput>, nextPrefix))
    }
  }

  return messages
}

export function ScenarioForm() {
  const currentInput = useScenarioStore((state) => state.currentInput)
  const updateInput = useScenarioStore((state) => state.updateInput)
  const setLatestSimulationOutput = useScenarioStore((state) => state.setLatestSimulationOutput)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<SimulationInput>({
    resolver: zodResolver(SimulationInputSchema),
    defaultValues: currentInput,
  })

  const zones = useFieldArray({ control: form.control, name: "zones" })
  const gates = useFieldArray({ control: form.control, name: "gates" })
  const phases = useFieldArray({ control: form.control, name: "phases" })
  const arrivals = useFieldArray({ control: form.control, name: "arrivals" })
  const mode = form.watch("mode")

  useEffect(() => {
    form.reset(currentInput)
  }, [currentInput, form])

  const onValidInput = (input: SimulationInput) => {
    setValidationErrors([])
    updateInput(input)
    const result = StadiumSim.run(input)
    setLatestSimulationOutput(result)
  }

  const onInvalidInput = (errors: FieldErrors<SimulationInput>) => {
    const flattened = collectErrorMessages(errors)
    setValidationErrors(flattened.length > 0 ? flattened : ["Invalid scenario input"])
  }

  const zoneRows = useMemo(
    () =>
      zones.fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-2" data-testid="zones-row">
          <ScenarioRow label="Zone ID">
            <input className="rounded border px-2 py-1" {...form.register(`zones.${index}.id` as const)} />
          </ScenarioRow>
          <ScenarioRow label="Capacity">
            <input
              type="number"
              className="rounded border px-2 py-1"
              {...form.register(`zones.${index}.capacity` as const, { valueAsNumber: true })}
            />
          </ScenarioRow>
        </div>
      )),
    [zones.fields, form],
  )

  return (
    <form className="flex flex-col gap-4 p-2" onSubmit={(event) => event.preventDefault()} data-testid="scenario-form">
      <div className="grid grid-cols-2 gap-2">
        <ScenarioRow label="Schema Version">
          <input className="rounded border px-2 py-1" {...form.register("schemaVersion")} />
        </ScenarioRow>
        <ScenarioRow label="Mode">
          <select className="rounded border px-2 py-1" {...form.register("mode")}>
            <option value="zone">zone</option>
            <option value="detailed">detailed</option>
          </select>
        </ScenarioRow>
      </div>

      <section className="space-y-2" data-testid="zones-section">
        <h3 className="text-sm font-semibold">Zones</h3>
        {zoneRows}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Gates</h3>
        {gates.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-2">
            <ScenarioRow label="Gate ID">
              <input className="rounded border px-2 py-1" {...form.register(`gates.${index}.id` as const)} />
            </ScenarioRow>
            <ScenarioRow label="Zone">
              <input className="rounded border px-2 py-1" {...form.register(`gates.${index}.zoneId` as const)} />
            </ScenarioRow>
            <ScenarioRow label="Throughput/min">
              <input
                type="number"
                className="rounded border px-2 py-1"
                {...form.register(`gates.${index}.throughputPerMin` as const, { valueAsNumber: true })}
              />
            </ScenarioRow>
            <ScenarioRow label="Delay (min)">
              <input
                type="number"
                className="rounded border px-2 py-1"
                {...form.register(`gates.${index}.delayMin` as const, { valueAsNumber: true })}
              />
            </ScenarioRow>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Phases</h3>
        {phases.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-3 gap-2 rounded-md border border-slate-200 p-2">
            <ScenarioRow label="Phase ID">
              <input className="rounded border px-2 py-1" {...form.register(`phases.${index}.id` as const)} />
            </ScenarioRow>
            <ScenarioRow label="Order">
              <input
                type="number"
                className="rounded border px-2 py-1"
                {...form.register(`phases.${index}.order` as const, { valueAsNumber: true })}
              />
            </ScenarioRow>
            <ScenarioRow label="Duration (min)">
              <input
                type="number"
                className="rounded border px-2 py-1"
                {...form.register(`phases.${index}.durationMin` as const, { valueAsNumber: true })}
              />
            </ScenarioRow>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Arrivals</h3>
        {arrivals.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-3 gap-2 rounded-md border border-slate-200 p-2">
            <ScenarioRow label="Phase">
              <input className="rounded border px-2 py-1" {...form.register(`arrivals.${index}.phaseId` as const)} />
            </ScenarioRow>
            <ScenarioRow label="Zone">
              <input className="rounded border px-2 py-1" {...form.register(`arrivals.${index}.zoneId` as const)} />
            </ScenarioRow>
            <ScenarioRow label="Demand Fans">
              <input
                type="number"
                className="rounded border px-2 py-1"
                {...form.register(`arrivals.${index}.demandFans` as const, { valueAsNumber: true })}
              />
            </ScenarioRow>
          </div>
        ))}
      </section>

      <Accordion data-testid="calibration-accordion">
        <AccordionItem value="advanced-calibration">
          <AccordionTrigger data-testid="advanced-calibration-trigger">Advanced Calibration</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-2" data-testid="advanced-calibration-content">
              {mode === "detailed" ? (
                <ScenarioRow label="Detailed sub-zones per zone">
                  <input
                    type="number"
                    className="rounded border px-2 py-1"
                    {...form.register("detailed.subZonesPerZone", { valueAsNumber: true })}
                  />
                </ScenarioRow>
              ) : (
                <p className="text-xs text-slate-600">
                  Switch mode to <strong>detailed</strong> to edit sub-zone calibration.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ValidationList errors={validationErrors} />

      <Button type="button" data-testid="run-button" onClick={form.handleSubmit(onValidInput, onInvalidInput)}>
        Run
      </Button>
    </form>
  )
}
