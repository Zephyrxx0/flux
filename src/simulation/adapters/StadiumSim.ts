import type { SimulationInput } from "../contracts/input.schema"
import type { SimulationOutput } from "../contracts/output.schema"
import { simulateDeterministic } from "../core/simulateDeterministic"

export class StadiumSim {
  constructor(private readonly input: SimulationInput) {}

  static run(input: SimulationInput): SimulationOutput {
    return simulateDeterministic(input)
  }

  run(): SimulationOutput {
    return StadiumSim.run(this.input)
  }
}
