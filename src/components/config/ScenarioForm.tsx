"use client";

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
import { Input } from "@/components/ui/input"
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
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
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
        <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-sm" data-testid="zones-row">
          <ScenarioRow label="Zone ID">
            <Input className="bg-background border-border" {...form.register(`zones.${index}.id` as const)} />
          </ScenarioRow>
          <ScenarioRow label="Capacity">
            <Input
              type="number"
              className="bg-background border-border"
              {...form.register(`zones.${index}.capacity` as const, { valueAsNumber: true })}
            />
          </ScenarioRow>
        </div>
      )),
    [zones.fields, form],
  )

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()} data-testid="scenario-form">
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-background p-4 shadow-sm">
        <ScenarioRow label="Schema Version">
          <Input className="bg-background border-border font-mono text-xs" {...form.register("schemaVersion")} />
        </ScenarioRow>
        <ScenarioRow label="Mode">
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...form.register("mode")}>
            <option value="zone">zone</option>
            <option value="detailed">detailed</option>
          </select>
        </ScenarioRow>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Zones</h3>
        <div className="flex flex-col gap-3">
          {zoneRows}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Gates</h3>
        <div className="flex flex-col gap-3">
          {gates.fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-sm">
              <ScenarioRow label="Gate ID">
                <Input className="bg-background border-border" {...form.register(`gates.${index}.id` as const)} />
              </ScenarioRow>
              <ScenarioRow label="Zone">
                <Input className="bg-background border-border" {...form.register(`gates.${index}.zoneId` as const)} />
              </ScenarioRow>
              <ScenarioRow label="Throughput/min">
                <Input
                  type="number"
                  className="bg-background border-border"
                  {...form.register(`gates.${index}.throughputPerMin` as const, { valueAsNumber: true })}
                />
              </ScenarioRow>
              <ScenarioRow label="Delay (min)">
                <Input
                  type="number"
                  className="bg-background border-border"
                  {...form.register(`gates.${index}.delayMin` as const, { valueAsNumber: true })}
                />
              </ScenarioRow>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Phases</h3>
        <div className="flex flex-col gap-3">
          {phases.fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-sm">
              <ScenarioRow label="Phase ID">
                <Input className="bg-background border-border" {...form.register(`phases.${index}.id` as const)} />
              </ScenarioRow>
              <ScenarioRow label="Order">
                <Input
                  type="number"
                  className="bg-background border-border"
                  {...form.register(`phases.${index}.order` as const, { valueAsNumber: true })}
                />
              </ScenarioRow>
              <ScenarioRow label="Duration (min)">
                <Input
                  type="number"
                  className="bg-background border-border"
                  {...form.register(`phases.${index}.durationMin` as const, { valueAsNumber: true })}
                />
              </ScenarioRow>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Arrivals</h3>
        <div className="flex flex-col gap-3">
          {arrivals.fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-sm">
              <ScenarioRow label="Phase">
                <Input className="bg-background border-border" {...form.register(`arrivals.${index}.phaseId` as const)} />
              </ScenarioRow>
              <ScenarioRow label="Zone">
                <Input className="bg-background border-border" {...form.register(`arrivals.${index}.zoneId` as const)} />
              </ScenarioRow>
              <ScenarioRow label="Demand Fans">
                <Input
                  type="number"
                  className="bg-background border-border"
                  {...form.register(`arrivals.${index}.demandFans` as const, { valueAsNumber: true })}
                />
              </ScenarioRow>
            </div>
          ))}
        </div>
      </section>

      <Accordion data-testid="calibration-accordion">
        <AccordionItem value="advanced-calibration" className="border-border">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-primary/80 hover:no-underline hover:text-primary" data-testid="advanced-calibration-trigger">Advanced Calibration</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-3 shadow-sm mt-2" data-testid="advanced-calibration-content">
              {mode === "detailed" ? (
                <ScenarioRow label="Detailed sub-zones per zone">
                  <Input
                    type="number"
                    className="bg-background border-border"
                    {...form.register("detailed.subZonesPerZone", { valueAsNumber: true })}
                  />
                </ScenarioRow>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Switch mode to <strong className="text-foreground">detailed</strong> to edit sub-zone calibration.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ValidationList errors={validationErrors} />

      <Button 
        type="button" 
        data-testid="run-button" 
        onClick={form.handleSubmit(onValidInput, onInvalidInput)}
        className="w-full bg-primary text-primary-foreground font-bold tracking-widest uppercase hover:bg-primary/90 transition-all"
      >
        Run Simulation
      </Button>
    </form>
  )
}
