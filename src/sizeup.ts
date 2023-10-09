import Changeset from "./changeset";
import { Formula } from "./formula"
import * as YAML from "yaml"
import * as fs from "fs"
import * as path from "path"
import { CategoryConfiguration } from "./category-configuration";
import { Score } from "./score";
import { Configuration } from "./configuration";

export class SizeUp {
  /**
   * Evaluates a diff for reviewability.
   *
   * @param diff A .diff formatted string containing the code to evaluate
   * @param configPath Path to a YAML configuration file containing options for how to evaluate the
   *   pull request. The YAML file should conform to the JSON schema in src/config/schema.json.
   */
  static evaluate(diff: string, configPath?: string): Score {
    const config: Configuration = configPath ? YAML.parse(fs.readFileSync(configPath, "utf8")) : {}
    const defaultConfig: Configuration = YAML.parse(
      fs.readFileSync(path.resolve(__dirname, "./config/default.yaml"), "utf8")
    )

    const ignoredFilePatterns = config.ignoredFilePatterns || defaultConfig.ignoredFilePatterns
    const testFilePatterns = config.testFilePatterns || defaultConfig.testFilePatterns
    const changeset = new Changeset({ diff, ignoredFilePatterns, testFilePatterns })
    const categories = new CategoryConfiguration(config.categories || defaultConfig.categories!)
    const formula = new Formula(config.scoring?.formula || defaultConfig.scoring!.formula)

    return formula.evaluate(changeset, categories)
  }
}

export { Score } from "./score";
